import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  Input,
  NgZone,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FormControl } from '@angular/forms';

import { Store } from '@ngxs/store';
import { ChangeArgs } from '@syncfusion/ej2-angular-buttons';
import { ChangeEventArgs } from '@syncfusion/ej2-angular-calendars';
import { catchError, EMPTY, filter, map, Observable, Subscription, switchMap, take, takeUntil, tap, zip } from 'rxjs';

import { FieldType } from '@core/enums';
import { Destroyable } from '@core/helpers';
import { CustomFormGroup, DropdownOption, Permission } from '@core/interface';
import { GlobalWindow } from '@core/tokens';
import { DatePickerLimitations } from '@shared/components/icon-multi-date-picker/icon-multi-date-picker.interface';
import { ScheduleShift } from '@shared/models/schedule-shift.model';
import { UnavailabilityReason } from '@shared/models/unavailability-reason.model';
import { ConfirmService } from '@shared/services/confirm.service';
import { ShiftsService } from '@shared/services/shift.service';
import { BookingsOverlapsRequest, BookingsOverlapsResponse } from '../replacement-order-dialog/replacement-order.interface';
import {
  AvailabilityFormConfig,
  BookFormConfig,
  ScheduleFormSourceKeys,
  ScheduleItemType,
  ScheduleSourcesMap,
  ScheduleTypes,
  UnavailabilityFormConfig,
} from '../../constants';
import * as ScheduleInt from '../../interface';
import {
  ScheduleBook,
  ScheduleBookingErrors,
  ScheduleFiltersConfig,
  ScheduleFilterStructure,
  ScheduleFormFieldConfig,
} from '../../interface';
import { ScheduleItemsComponent } from '../schedule-items/schedule-items.component';
import { CreateScheduleService, ScheduleApiService, ScheduleFiltersService } from '../../services';
import {
  CreateBookingSuccessMessage,
  CreateScheduleSuccessMessage,
  DisableScheduleControls,
  GetShiftHours,
  GetShiftTimeControlsValue,
  MapShiftToDropdownOptions,
  MapToDropdownOptions,
  ScheduleFilterHelper,
} from '../../helpers';
import { Skill } from '@shared/models/skill.model';
import { ShowToast } from '../../../../store/app.actions';
import { MessageTypes } from '@shared/enums/message-types';
import { ScheduleItemsService } from '../../services/schedule-items.service';
import { OrganizationStructure } from '@shared/models/organization.model';
import { EditScheduleFormSourceKeys } from '../edit-schedule/edit-schedule.constants';
import { CANCEL_CONFIRM_TEXT, DELETE_CONFIRM_TITLE } from '@shared/constants';
import { OutsideZone } from '@core/decorators';
import {
  EndTimeField,
  ScheduleControlsToReset,
  ScheduleCustomClassesList,
  StartTimeField,
} from './create-schedules.constant';

@Component({
  selector: 'app-create-schedule',
  templateUrl: './create-schedule.component.html',
  styleUrls: ['./create-schedule.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateScheduleComponent extends Destroyable implements OnInit, OnChanges {
  @ViewChild(ScheduleItemsComponent) scheduleItemsComponent: ScheduleItemsComponent;

  @Input() scheduleFilterData: ScheduleFiltersConfig;
  @Input() selectedScheduleFilters: ScheduleInt.ScheduleFilters;
  @Input() scheduleSelectedSlots: ScheduleInt.ScheduleSelectedSlots;
  @Input() datePickerLimitations: DatePickerLimitations;
  @Input() userPermission: Permission = {};

  @Input() set scheduleData(page: ScheduleInt.ScheduleModelPage | null) {
    if (page) {
      this.createScheduleService.scheduleData = page.items;
    }
  }

  readonly targetElement: HTMLBodyElement = this.globalWindow.document.body as HTMLBodyElement;
  readonly FieldTypes = FieldType;
  readonly scheduleTypesControl: FormControl = new FormControl(ScheduleItemType.Book);
  readonly dropDownFields = { text: 'text', value: 'value' };
  readonly scheduleFormSourcesMap: ScheduleInt.ScheduleFormSource = ScheduleSourcesMap;

  scheduleTypes: ReadonlyArray<ScheduleInt.ScheduleTypeRadioButton> = ScheduleTypes;
  scheduleForm: CustomFormGroup<ScheduleInt.ScheduleForm>;
  scheduleFormConfig: ScheduleInt.ScheduleFormConfig;
  scheduleType: ScheduleItemType;
  replacementOrderDialogOpen = false;
  replacementOrderDialogData: BookingsOverlapsResponse[] = [];
  showScheduleForm = true;

  private readonly customShiftId = -1;
  private shiftControlSubscription: Subscription | null;
  private scheduleShifts: ScheduleShift[] = [];
  private scheduleStructureList: ScheduleFilterStructure;
  private firstLoadDialog = true;
  private scheduleToBook: ScheduleInt.ScheduleBook | null;

  constructor(
    @Inject(GlobalWindow) protected readonly globalWindow: WindowProxy & typeof globalThis,
    private createScheduleService: CreateScheduleService,
    private scheduleItemsService: ScheduleItemsService,
    private scheduleApiService: ScheduleApiService,
    private confirmService: ConfirmService,
    private shiftsService: ShiftsService,
    private cdr: ChangeDetectorRef,
    private scheduleFiltersService: ScheduleFiltersService,
    private readonly ngZone: NgZone,
    private store: Store,
  ) {
    super();
  }

  ngOnInit(): void {
    this.setInitData();
    this.watchForScheduleType();
  }

  ngOnChanges(changes: SimpleChanges) {
    const candidates = changes['scheduleSelectedSlots']?.currentValue.candidates;

    if(candidates?.length && !this.showScheduleForm){
      this.showScheduleForm = true;
    }

    if(candidates && candidates?.length >= 1) {
      this.createScheduleService.setOrientationControlValue(this.scheduleSelectedSlots, this.scheduleForm);
    }
  }

  closeSchedule(): void {
   if (this.scheduleForm?.touched) {
      this.confirmService.confirm(
        CANCEL_CONFIRM_TEXT,
        {
          title: DELETE_CONFIRM_TITLE,
          okButtonLabel: 'Leave',
          okButtonClass: 'delete-button',
        })
        .pipe(
          take(1),
          filter(Boolean),
          takeUntil(this.componentDestroy()),
        ).subscribe(() => {
          this.closeSideBar();
          this.firstLoadDialog = false;
        });
    } else {
      this.closeSideBar();
      this.firstLoadDialog = false;
    }
  }

  changeScheduleType(event: ChangeArgs): void {
    this.updateScheduleDialogConfig(event.value as unknown as ScheduleItemType);
    this.showShiftTimeFields(false);
    this.scheduleFormConfig.formClass =
      this.createScheduleService.updateScheduleFormClass(this.scheduleType, false);
    this.cdr.markForCheck();
  }

  hideScheduleForm(): void {
    this.showScheduleForm = false;
  }

  saveNewBooking(createOrder: boolean): void {
    if (this.scheduleToBook) {
      this.scheduleToBook.createOrder = createOrder;
      this.saveBooking()
        .pipe(takeUntil(this.componentDestroy()))
        .subscribe(() => {
          this.successSave();
        });
    }
  }

  changeTimeControls(event: ChangeEventArgs, field: string): void {
    const shiftIdControl = this.scheduleForm.get('shiftId');
    const startTimeDate = field === StartTimeField ? event.value : this.scheduleForm.get(StartTimeField)?.value;
    const endTimeDate = field === EndTimeField ? event.value : this.scheduleForm.get(EndTimeField)?.value;

    if (shiftIdControl?.value !== this.customShiftId) {
      shiftIdControl?.setValue(this.customShiftId);
    }

    this.setHours(startTimeDate, endTimeDate);
  }

  saveSchedule(): void {
   if (this.scheduleForm.invalid) {
      this.scheduleForm.markAllAsTouched();
      return;
    }

    if (this.scheduleType === ScheduleItemType.Book) {
      this.checkBookingsOverlaps();
    } else {
      this.saveAvailabilityUnavailability();
    }
  }

  closeReplacementOrderDialog(): void {
    this.replacementOrderDialogOpen = false;
    this.cdr.markForCheck();
  }

  saveBooking(): Observable<ScheduleBookingErrors[]> {
    return this.scheduleApiService.createBookSchedule(this.scheduleToBook as ScheduleBook).pipe(
      catchError((error: HttpErrorResponse) => this.createScheduleService.handleErrorMessage(error)),
      tap((errors: ScheduleBookingErrors[]) => {
        this.scheduleItemsService.setErrors(errors);
        return errors;
      }),
      filter((errors: ScheduleBookingErrors[]) => {
        return !errors;
      }),
    );
  }

  private openReplacementOrderDialog(replacementOrderDialogData: BookingsOverlapsResponse[]): void {
    this.replacementOrderDialogData = replacementOrderDialogData;
    this.replacementOrderDialogOpen = true;
    this.cdr.markForCheck();
  }

  private setHours(
    startTimeDate: Date = this.scheduleForm.get('startTime')?.value,
    endTimeDate: Date = this.scheduleForm.get('endTime')?.value,
  ): void {
    if (startTimeDate && endTimeDate) {
      this.scheduleForm.get('hours')?.setValue(GetShiftHours(startTimeDate, endTimeDate));
    }
  }

  private updateScheduleDialogConfig(scheduleTypeMode: ScheduleItemType): void {
    this.scheduleType = scheduleTypeMode;

    switch (this.scheduleType) {
      case ScheduleItemType.Book:
        this.scheduleFormConfig = BookFormConfig;
        this.scheduleForm = this.createScheduleService.createBookForm();
        this.watchForControls();
        this.createScheduleService.setOrientationControlValue(this.scheduleSelectedSlots, this.scheduleForm);
        this.patchBookForm();
        this.patchBookForSingleCandidate();
        break;
      case ScheduleItemType.Unavailability:
        this.scheduleFormConfig = UnavailabilityFormConfig;
        this.scheduleForm = this.createScheduleService.createUnavailabilityForm();
        break;
      case ScheduleItemType.Availability:
        this.scheduleFormConfig = AvailabilityFormConfig;
        this.scheduleForm = this.createScheduleService.createAvailabilityForm();
        break;
    }

    this.watchForShiftControl();
  }

  private watchForShiftControl(): void {
    if (this.shiftControlSubscription) {
      this.shiftControlSubscription.unsubscribe();
      this.shiftControlSubscription = null;
    }

    this.shiftControlSubscription = this.scheduleForm.get('shiftId')?.valueChanges
      .pipe(
        tap((shiftId: number) => {
          this.createScheduleService.setOnCallControlValue(
            this.scheduleForm,
            shiftId,
            this.scheduleShifts
          );
        }),
        map((shiftId: number) => this.updateConfigWithShiftTime(shiftId)),
        filter(Boolean),
        takeUntil(this.componentDestroy()),
      ).subscribe((shift: ScheduleShift) => {
        this.scheduleForm.patchValue(GetShiftTimeControlsValue(shift.startTime, shift.endTime));
        this.setHours();
      }) as Subscription;
  }

  private updateConfigWithShiftTime(shiftId: number):ScheduleShift | undefined {
    if(shiftId === this.customShiftId) {
      this.showShiftTimeFields(true);
      this.scheduleFormConfig.formClass =
        this.createScheduleService.updateScheduleFormClass(this.scheduleType, true);

      this.cdr.markForCheck();
      return;
    } else {
      this.showShiftTimeFields(false);
      this.scheduleFormConfig.formClass =
        this.createScheduleService.updateScheduleFormClass(this.scheduleType, false);

      this.cdr.markForCheck();
      return this.scheduleShifts.find((shift: ScheduleShift) => shift.id === shiftId);
    }
  }

  private isCandidatesFiltered(): boolean {
    return !!this.selectedScheduleFilters?.regionIds?.length && !!this.selectedScheduleFilters?.locationIds?.length;
  }

  private patchBookForm(): void {
    if (this.isCandidatesFiltered()) {
      this.scheduleFormSourcesMap[ScheduleFormSourceKeys.Regions] = this.scheduleFilterData.regionIds.dataSource;
      this.scheduleFormSourcesMap[ScheduleFormSourceKeys.Locations] = this.scheduleFilterData.locationIds.dataSource;
      this.scheduleFormSourcesMap[ScheduleFormSourceKeys.Departments] = this.scheduleFilterData.departmentsIds.dataSource;
      this.scheduleFormSourcesMap[ScheduleFormSourceKeys.Skills] = this.scheduleFilterData.skillIds.dataSource;

      this.scheduleForm.get('regionId')?.setValue(((this.selectedScheduleFilters.regionIds as number[])[0]));
      this.scheduleForm.get('locationId')?.setValue((this.selectedScheduleFilters.locationIds as number[])[0]);
      this.scheduleForm.get('departmentId')?.setValue((this.selectedScheduleFilters.departmentsIds as number[])[0]);
      this.scheduleForm.get('skillId')?.setValue((this.selectedScheduleFilters.skillIds as number[])[0]);

      DisableScheduleControls(this.scheduleForm, ['regionId', 'locationId', 'departmentId', 'skillId']);
    }
  }

  private watchForControls(): void {
    if (!this.selectedScheduleFilters?.regionIds?.length && !this.selectedScheduleFilters?.locationIds?.length) {
      this.scheduleForm.get('regionId')?.valueChanges.pipe(
        filter(Boolean),
        takeUntil(this.componentDestroy())
      ).subscribe((value: number) => {
        this.scheduleForm.get('locationId')?.patchValue([], { emitEvent: false, onlySelf: true });
        this.scheduleFormSourcesMap[ScheduleFormSourceKeys.Locations] = this.scheduleFiltersService
          .getSelectedLocatinOptions(this.scheduleStructureList, [value]);
        this.cdr.markForCheck();
      });

      this.scheduleForm.get('locationId')?.valueChanges.pipe(
        filter(Boolean),
        takeUntil(this.componentDestroy())
      ).subscribe((value: number) => {
        this.scheduleForm.get('departmentsId')?.patchValue([], { emitEvent: false, onlySelf: true });
        this.scheduleFormSourcesMap[ScheduleFormSourceKeys.Departments] = this.scheduleFiltersService
          .getSelectedDepartmentOptions(this.scheduleStructureList, [value], false);

        this.cdr.markForCheck();
      });

      this.scheduleForm.get('departmentId')?.valueChanges.pipe(
        filter(Boolean),
        switchMap((value: number) => {
          return this.scheduleApiService.getSkillsByEmployees(value, this.scheduleSelectedSlots.candidates[0].id);
        }),
        takeUntil(this.componentDestroy())
      ).subscribe((skills: Skill[]) => {
        const skillOption = ScheduleFilterHelper.adaptMasterSkillToOption(skills);
        this.scheduleFormSourcesMap[ScheduleFormSourceKeys.Skills] = skillOption;

        if(this.firstLoadDialog && this.isSelectedCandidateWithoutFilters()) {
          this.scheduleForm?.get('skillId')?.setValue(skillOption[0]?.value);
          this.firstLoadDialog = false;
        }
        this.cdr.markForCheck();
      });
    }

    this.scheduleForm.get('orientated')?.valueChanges.pipe(
      takeUntil(this.componentDestroy())
    ).subscribe((value: boolean) => {
      this.createScheduleService.hideToggleControls(this.scheduleFormConfig, !value);
      this.cdr.markForCheck();
    });
  }

  private patchBookForSingleCandidate(): void {
    if(this.isSelectedCandidateWithoutFilters()) {
      const region = this.scheduleStructureList.regions[0];
      this.scheduleFormSourcesMap.locations = this.scheduleFiltersService
      .getSelectedLocatinOptions(this.scheduleStructureList, [region.id as number]);
      this.scheduleFormSourcesMap.departments = this.scheduleFiltersService
      .getSelectedDepartmentOptions(this.scheduleStructureList, [this.scheduleFormSourcesMap.locations[0].value as number]);

      this.scheduleForm?.get('regionId')?.setValue(region.id);
      this.scheduleForm?.get('locationId')?.setValue(this.scheduleFormSourcesMap.locations[0]?.value);
      this.scheduleForm?.get('departmentId')?.setValue(this.scheduleFormSourcesMap.departments[0]?.value);
      this.scheduleForm?.get('skillId')?.setValue(this.scheduleFormSourcesMap.skill[0]?.value);
    }
  }

  private isSelectedCandidateWithoutFilters(): boolean {
    return !this.isCandidatesFiltered() && this.scheduleSelectedSlots.candidates?.length === 1;
  }

  private watchForScheduleType(): void {
    this.scheduleTypesControl.valueChanges.pipe(
      takeUntil(this.componentDestroy())
    ).subscribe((type: number) => {
      this.scheduleType = type;
    });
  }

  private closeSideBar(): void {
    this.createScheduleService.closeSideBarEvent.next(true);
    this.scheduleItemsService.setErrors([]);
    this.showShiftTimeFields(false);
    this.scheduleFormConfig.formClass = this.createScheduleService.updateScheduleFormClass(this.scheduleType, false);
  }

  private saveAvailabilityUnavailability(): void {
    const schedule = this.createScheduleService.createAvailabilityUnavailability(
      this.scheduleForm,
      this.scheduleItemsComponent.scheduleItems,
      this.scheduleTypesControl.value,
      this.customShiftId
    );
    const successMessage = CreateScheduleSuccessMessage(schedule);

    this.scheduleApiService.createSchedule(schedule)
      .pipe(
        catchError((error: HttpErrorResponse) => this.createScheduleService.handleError(error)),
        takeUntil(this.componentDestroy())
      )
      .subscribe(() => {
        this.handleSuccessSaveDate(successMessage);
      });
  }

  private handleSuccessSaveDate(message: string): void {
    this.createScheduleService.resetScheduleControls(this.scheduleForm, ScheduleControlsToReset);
    this.createScheduleService.closeSideBarEvent.next(false);
    this.scheduleForm.markAsUntouched();
    this.store.dispatch(new ShowToast(MessageTypes.Success, message));
  }

  private setScheduleTypesPermissions(): void {
    this.scheduleTypes = this.createScheduleService.getScheduleTypesWithPermissions(this.scheduleTypes, this.userPermission);
    this.scheduleType = this.createScheduleService.getFirstAllowedScheduleType(this.scheduleTypes);
    this.setTypesControlValue();
    this.updateScheduleDialogConfig(this.scheduleType);
  }

  @OutsideZone
  private setTypesControlValue(): void {
    if(this.scheduleType !== ScheduleItemType.Book) {
      setTimeout(() => {
        this.scheduleTypesControl.setValue(this.scheduleType);
      },0);
    }
  }

  private checkBookingsOverlaps(): void {
    this.scheduleToBook = this.createScheduleService.createBooking(
      this.scheduleForm,
      this.scheduleItemsComponent.scheduleItems,
      this.customShiftId,
    );
    const request: BookingsOverlapsRequest = {
      employeeScheduledDays: this.scheduleToBook.employeeBookedDays,
      shiftId: this.scheduleToBook.shiftId,
      startTime: this.scheduleToBook.startTime,
      endTime: this.scheduleToBook.endTime,
    };

    this.scheduleApiService.checkBookingsOverlaps(request).pipe(
      catchError((error: HttpErrorResponse) => this.createScheduleService.handleError(error)),
      switchMap((response: BookingsOverlapsResponse[]) => {
        if (!response.length && this.scheduleToBook) {
          return this.saveBooking();
        } else {
          this.openReplacementOrderDialog(response);

          return EMPTY;
        }
      }),
      takeUntil(this.componentDestroy())
    ).subscribe(() => {
      this.successSave();
    });
  }

  private successSave(): void {
    this.scheduleItemsService.setErrors([]);
    this.handleSuccessSaveDate(CreateBookingSuccessMessage(this.scheduleToBook as ScheduleInt.ScheduleBook));
    this.scheduleToBook = null;
  }

  private setInitData(): void {
    zip(this.getScheduleFilterStructure(),this.getShifts(), this.getUnavailabilityReasons())
      .pipe(takeUntil(this.componentDestroy()))
      .subscribe(() => {
        this.setScheduleTypesPermissions();
        this.cdr.markForCheck();
      });
  }

  private getShifts(): Observable<DropdownOption[]> {
    return this.shiftsService.getAllShifts().pipe(
      catchError((error: HttpErrorResponse) => this.createScheduleService.handleError(error)),
      tap((shifts: ScheduleShift[]) => this.scheduleShifts = shifts),
      map((shifts: ScheduleShift[]) => MapShiftToDropdownOptions(shifts)),
      tap(((shifts: DropdownOption[]) => {
        this.scheduleFormSourcesMap[EditScheduleFormSourceKeys.Shifts] = [
          { text: 'Custom', value: this.customShiftId },
          ...shifts,
        ];
      })),
    );
  }

  private getScheduleFilterStructure(): Observable<ScheduleFilterStructure> {
    return this.scheduleApiService.getEmployeesStructure(this.scheduleSelectedSlots.candidates[0].id).pipe(
      map((structure: OrganizationStructure) => {
        return this.scheduleFiltersService.createFilterStructure(structure.regions);
      }),
      tap((structure: ScheduleFilterStructure) => {
        this.scheduleStructureList = structure;
        this.scheduleFormSourcesMap[ScheduleFormSourceKeys.Regions] =
          ScheduleFilterHelper.adaptRegionToOption(structure.regions);
      }),
    );
  }

  private getUnavailabilityReasons(): Observable<DropdownOption[]> {
    return this.scheduleApiService.getUnavailabilityReasons().pipe(
      catchError((error: HttpErrorResponse) => this.createScheduleService.handleError(error)),
      map((reasons: UnavailabilityReason[]) => MapToDropdownOptions(reasons)),
      tap(((reasons: DropdownOption[]) => {
        this.scheduleFormSourcesMap[EditScheduleFormSourceKeys.Reasons] = reasons;
      })),
    );
  }

  private showShiftTimeFields(show: boolean): void {
    this.scheduleFormConfig.formFields.forEach((field: ScheduleFormFieldConfig) => {
      if(field.field === StartTimeField || field.field === EndTimeField) {
        field.show = show;
      }
    });
  }
}
