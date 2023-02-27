import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormControl } from '@angular/forms';

import { Store } from '@ngxs/store';
import { ChangeArgs } from '@syncfusion/ej2-angular-buttons';
import { catchError, filter, map, Subscription, switchMap, take, takeUntil, tap } from 'rxjs';

import { FieldType } from '@core/enums';
import { DestroyDialog } from '@core/helpers';
import { CustomFormGroup, DropdownOption } from '@core/interface';
import { GlobalWindow } from '@core/tokens';
import { CANCEL_CONFIRM_TEXT, DELETE_CONFIRM_TITLE } from '@shared/constants';
import { DatePickerLimitations } from '@shared/components/icon-multi-date-picker/icon-multi-date-picker.interface';
import { ScheduleShift } from '@shared/models/schedule-shift.model';
import { UnavailabilityReason } from '@shared/models/unavailability-reason.model';
import { ConfirmService } from '@shared/services/confirm.service';
import { ShiftsService } from '@shared/services/shift.service';
import { convertMsToTime, getHoursMinutesSeconds } from '@shared/utils/date-time.utils';
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
import { ScheduleBookingErrors, ScheduleFiltersConfig, ScheduleFilterStructure } from '../../interface';
import { CreateScheduleService } from '../../services/create-schedule.service';
import { ScheduleItemsComponent } from '../schedule-items/schedule-items.component';
import { ScheduleApiService, ScheduleFiltersService } from '../../services';
import { CreateBookingSuccessMessage,
  CreateScheduleSuccessMessage,
  DisableScheduleControls,
  ScheduleFilterHelper,
} from '../../helpers';
import { Skill } from '@shared/models/skill.model';
import { ShowToast } from '../../../../store/app.actions';
import { MessageTypes } from '@shared/enums/message-types';
import { ScheduleItemsService } from '../../services/schedule-items.service';

@Component({
  selector: 'app-create-schedule',
  templateUrl: './create-schedule.component.html',
  styleUrls: ['./create-schedule.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateScheduleComponent extends DestroyDialog implements OnInit {
  @ViewChild(ScheduleItemsComponent) scheduleItemsComponent: ScheduleItemsComponent;

  @Input() scheduleFilterData: ScheduleFiltersConfig;
  @Input() selectedScheduleFilters: ScheduleInt.ScheduleFilters;
  @Input() scheduleSelectedSlots: ScheduleInt.ScheduleSelectedSlots;
  @Input() datePickerLimitations: DatePickerLimitations;

  @Input() set scheduleStructure(structure: ScheduleFilterStructure) {
    if (structure.regions?.length) {
      this.setScheduleStructure(structure);
    }
  }

  @Input() set scheduleData(page: ScheduleInt.ScheduleModelPage | null) {
    if (page) {
      this.createScheduleService.scheduleData = page.items;
    }
  }

  @Output() updateScheduleGrid: EventEmitter<void> = new EventEmitter<void>();

  readonly targetElement: HTMLBodyElement = this.globalWindow.document.body as HTMLBodyElement;
  readonly scheduleTypes: ReadonlyArray<ScheduleInt.ScheduleTypeRadioButton> = ScheduleTypes;
  readonly scheduleTypeNumberEnum = ScheduleItemType;
  readonly FieldTypes = FieldType;
  readonly scheduleTypesControl: FormControl = new FormControl(this.scheduleTypeNumberEnum.Book);
  readonly dropDownFields = { text: 'text', value: 'value' };
  readonly scheduleFormSourcesMap: ScheduleInt.ScheduleFormSource = ScheduleSourcesMap;

  scheduleForm: CustomFormGroup<ScheduleInt.ScheduleForm>;
  scheduleFormConfig: ScheduleInt.ScheduleFormConfig;
  scheduleTypeNumber: ScheduleItemType;
  showScheduleForm = true;
  selectedScheduleType: ScheduleItemType | null = null;

  private readonly customShiftId = -1;
  private shiftControlSubscription: Subscription | null;
  private scheduleShifts: ScheduleShift[] = [];
  private scheduleStructureList: ScheduleFilterStructure;
  private firstLoadDialog = true;

  constructor(
    @Inject(GlobalWindow) protected readonly globalWindow: WindowProxy & typeof globalThis,
    private createScheduleService: CreateScheduleService,
    private scheduleItemsService: ScheduleItemsService,
    private scheduleApiService: ScheduleApiService,
    private confirmService: ConfirmService,
    private shiftsService: ShiftsService,
    private cdr: ChangeDetectorRef,
    private scheduleFiltersService: ScheduleFiltersService,
    private store: Store,
  ) {
    super();
  }

  ngOnInit(): void {
    this.watchForCloseStream();
    this.getUnavailabilityReasons();
    this.getShifts();
    this.updateScheduleDialogConfig(ScheduleItemType.Book);
    this.watchForControls();
    this.watchForScheduleType();
  }

  closeScheduleDialog(): void {
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
        )
        .subscribe(() => {
          this.handleCloseDialog();
          this.firstLoadDialog = false;
        });
    } else {
      this.handleCloseDialog();
      this.firstLoadDialog = false;
    }
  }

  changeScheduleType(event: ChangeArgs): void {
    this.updateScheduleDialogConfig(event.value as unknown as ScheduleItemType);
  }

  hideScheduleForm(): void {
    this.showScheduleForm = false;
  }

  selectCustomShift(): void {
    this.scheduleForm.get('shiftId')?.setValue(this.customShiftId);
  }

  setHours(): void {
    const startTimeDate = this.scheduleForm.get('startTime')?.value;
    const endTimeDate = this.scheduleForm.get('endTime')?.value;

    // TODO: move to service
    if (startTimeDate && endTimeDate) {
      const startTimeMs: number = startTimeDate.getTime();
      let endTimeMs: number = endTimeDate.getTime();

      if (startTimeMs > endTimeMs) {
        const dayMs = 86400000;
        endTimeMs = endTimeMs + dayMs;
      }

      this.scheduleForm.get('hours')?.setValue(convertMsToTime(endTimeMs - startTimeMs));
    }
  }

  saveSchedule(): void {
    if (this.scheduleForm.invalid) {
      this.scheduleForm.markAllAsTouched();
      return;
    }

    switch (true) {
      case this.selectedScheduleType === ScheduleItemType.Book:
        this.saveBooking();
        return;
      case this.selectedScheduleType === ScheduleItemType.Unavailability:
        this.saveAvailabilityUnavailability();
        return;
      case this.selectedScheduleType === ScheduleItemType.Availability:
        this.saveAvailabilityUnavailability();
        return;
      default:
        this.saveBooking();
    }
  }

  private getUnavailabilityReasons(): void {
    this.scheduleApiService.getUnavailabilityReasons()
      .pipe(
        catchError((error: HttpErrorResponse) => this.createScheduleService.handleError(error)),
        map((reasons: UnavailabilityReason[]) => this.createScheduleService.mapToDropdownOptions(reasons)),
        takeUntil(this.componentDestroy())
      )
      .subscribe((reasons: DropdownOption[]) => {
        this.scheduleFormSourcesMap[ScheduleFormSourceKeys.Reasons] = reasons;
        this.cdr.markForCheck();
      });
  }

  private getShifts(): void {
    this.shiftsService.getAllShifts()
      .pipe(
        catchError((error: HttpErrorResponse) => this.createScheduleService.handleError(error)),
        tap((shifts: ScheduleShift[]) => this.scheduleShifts = shifts),
        map((shifts: ScheduleShift[]) => this.createScheduleService.mapToDropdownOptions(shifts)),
        takeUntil(this.componentDestroy())
      )
      .subscribe((shifts: DropdownOption[]) => {
        this.scheduleFormSourcesMap[ScheduleFormSourceKeys.Shifts] = [
          { text: 'Custom', value: this.customShiftId },
          ...shifts,
        ];
        this.cdr.markForCheck();
      });
  }

  private updateScheduleDialogConfig(scheduleTypeMode: ScheduleItemType): void {
    this.scheduleTypeNumber = scheduleTypeMode;

    switch (this.scheduleTypeNumber) {
      case ScheduleItemType.Book:
        this.scheduleFormConfig = BookFormConfig;
        this.scheduleForm = this.createScheduleService.createBookForm();
        this.patchBookForm();
        if(!this.firstLoadDialog) {
          this.patchBookForSingleCandidate();
        }
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
      .pipe(takeUntil(this.componentDestroy()))
      .subscribe((shiftId: number) => {
        const shift = this.scheduleShifts.find((shift: ScheduleShift) => shift.id === shiftId);

        if (shift) {
          // TODO: move to service
          const [startH, startM, startS] = getHoursMinutesSeconds(shift.startTime);
          const [endH, endM, endS] = getHoursMinutesSeconds(shift.endTime);
          const startTime = new Date();
          const endTime = new Date();
          startTime.setHours(startH, startM, startS);
          endTime.setHours(endH, endM, endS);

          this.scheduleForm.patchValue({ startTime, endTime });
          this.setHours();
        }
      }) as Subscription;
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
      if (this.selectedScheduleFilters.skillIds) {
        this.scheduleForm.get('skillId')?.setValue((this.selectedScheduleFilters.skillIds as number[])[0]);
      }

      DisableScheduleControls(this.scheduleForm, ['regionId', 'locationId', 'departmentId']);
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
          .getSelectedDepartmentOptions(this.scheduleStructureList, [value]);

        this.cdr.markForCheck();
      });

      this.scheduleForm.get('departmentId')?.valueChanges.pipe(
        filter(Boolean),
        switchMap((value: number) => {
          return this.scheduleApiService.getSkillsByEmployees(this.scheduleSelectedSlots.candidates[0].id, value);
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
  }

  private setScheduleStructure(structure: ScheduleFilterStructure): void {
    this.scheduleStructureList = structure;
    this.scheduleFormSourcesMap[ScheduleFormSourceKeys.Regions] =
      ScheduleFilterHelper.adaptRegionToOption(structure.regions);

    this.patchBookForSingleCandidate();
  }

  private patchBookForSingleCandidate(): void {
    if(this.isSelectedCandidateWithoutFilters()) {
      this.scheduleForm?.get('regionId')?.setValue(this.scheduleStructureList.regions[0].id);
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
      map((type: number) => {
        if (type === ScheduleItemType.Book) {
          this.watchForControls();
        }
        return type;
      }),
      takeUntil(this.componentDestroy())
    ).subscribe((type: number) => {
      this.selectedScheduleType = type;
    });
  }

  private handleCloseDialog(): void {
    this.closeDialog();
    this.scheduleItemsService.setErrors([]);
  }

  private saveAvailabilityUnavailability(): void {
    const schedule = this.createScheduleService.createAvailabilityUnavailability(
      this.scheduleForm,
      this.scheduleItemsComponent,
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

  private saveBooking(): void {
    const schedule = this.createScheduleService.createBooking(
      this.scheduleForm,
      this.scheduleItemsComponent,
      this.customShiftId,
    );
    const successMessage = CreateBookingSuccessMessage(schedule);

    this.scheduleApiService.createBookSchedule(schedule).pipe(
      catchError((error: HttpErrorResponse) => this.createScheduleService.handleErrorMessage(error)),
      tap((errors: ScheduleBookingErrors[]) => {
        this.scheduleItemsService.setErrors(errors);
        return errors;
      }),
      filter((errors: ScheduleBookingErrors[]) => {
        return !errors;
      }),
      takeUntil(this.componentDestroy())
    ).subscribe(() => {
      this.scheduleItemsService.setErrors([]);
      this.handleSuccessSaveDate(successMessage);
    });
  }

  private handleSuccessSaveDate(message: string): void {
    this.updateScheduleGrid.emit();
    this.scheduleForm.markAsUntouched();
    this.closeDialog();
    this.store.dispatch(new ShowToast(MessageTypes.Success, message));
  }
}
