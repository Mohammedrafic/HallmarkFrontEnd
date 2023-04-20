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
import {
  catchError,
  combineLatest,
  EMPTY,
  filter,
  map,
  Observable,
  Subscription,
  switchMap,
  take,
  takeUntil,
  tap,
  zip,
} from 'rxjs';

import { OutsideZone } from '@core/decorators';
import { FieldType } from '@core/enums';
import { DateTimeHelper, Destroyable } from '@core/helpers';
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
  OpenPositionsConfig,
  ScheduleItemType,
  ScheduleSourcesMap,
  ScheduleTypes,
  UnavailabilityFormConfig,
} from '../../constants';
import * as ScheduleInt from '../../interface';
import {
  BarSettings,
  DeleteScheduleRequest,
  OpenPositionsList,
  ScheduleBook,
  ScheduleBookingErrors,
  ScheduleFormFieldConfig,
} from '../../interface';
import { ScheduleItemsComponent } from '../schedule-items/schedule-items.component';
import { CreateScheduleService, OpenPositionService, ScheduleApiService, ScheduleFiltersService } from '../../services';
import {
  CreateBookingSuccessMessage,
  CreateScheduleSuccessMessage,
  GetShiftHours,
  GetShiftTimeControlsValue,
  MapShiftToDropdownOptions,
  MapToDropdownOptions,
} from '../../helpers';
import { ShowToast } from '../../../../store/app.actions';
import { MessageTypes } from '@shared/enums/message-types';
import { ScheduleItemsService } from '../../services/schedule-items.service';
import { EditScheduleFormSourceKeys } from '../edit-schedule/edit-schedule.constants';
import { CANCEL_CONFIRM_TEXT, DELETE_CONFIRM_TITLE, RECORD_MODIFIED } from '@shared/constants';
import {
  EndTimeField,
  RemoveButtonToolTip,
  ScheduleControlsToReset,
  SideBarSettings,
  StartTimeField,
} from './create-schedules.constant';
import { ScheduleType } from '../../enums';

@Component({
  selector: 'app-create-schedule',
  templateUrl: './create-schedule.component.html',
  styleUrls: ['./create-schedule.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateScheduleComponent extends Destroyable implements OnInit, OnChanges {
  @ViewChild(ScheduleItemsComponent) scheduleItemsComponent: ScheduleItemsComponent;

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
  readonly removeBtnTooltip: string = RemoveButtonToolTip;

  scheduleTypes: ReadonlyArray<ScheduleInt.ScheduleTypeRadioButton> = ScheduleTypes;
  scheduleForm: CustomFormGroup<ScheduleInt.ScheduleForm>;
  scheduleFormConfig: ScheduleInt.ScheduleFormConfig;
  scheduleType: ScheduleItemType;
  replacementOrderDialogData: BookingsOverlapsResponse[] = [];
  sideBarSettings: BarSettings = SideBarSettings;

  private readonly customShiftId = -1;
  private shiftControlSubscription: Subscription | null;
  private scheduleShifts: ScheduleShift[] = [];
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
    private openPositionService: OpenPositionService
  ) {
    super();
  }

  ngOnInit(): void {
    this.setInitData();
    this.watchForScheduleType();
  }

  ngOnChanges(changes: SimpleChanges) {
    const candidates = changes['scheduleSelectedSlots']?.currentValue.candidates;

    if(candidates?.length && !this.sideBarSettings.showScheduleForm){
      this.sideBarSettings.showScheduleForm = true;
    }

    if(candidates && candidates?.length >= 1) {
      this.getOpenPositions();
      this.createScheduleService.setOrientationControlValue(this.scheduleSelectedSlots, this.scheduleForm);
      this.sideBarSettings.showRemoveButton = this.createScheduleService.hasSelectedSlotsWithDate(candidates);
    }
  }

  removeSchedules(): void {
    const hasBookDate = this.createScheduleService.hasBookingDate(this.scheduleSelectedSlots.candidates);

    if(hasBookDate) {
      this.sideBarSettings.replacementOrderDialogOpen = true;
      this.sideBarSettings.removeReplacementMode = true;

      this.replacementOrderDialogData = this.createScheduleService.prepareCandidateReplacementDates(
        this.scheduleSelectedSlots.candidates
      );
    } else {
      this.deleteSchedule();
    }
  }

  deleteSchedule(createPerDiem = false): void {
    const deleteScheduleRequest: DeleteScheduleRequest = {
      ids: this.createScheduleService.getIdsRemovedDates(this.scheduleSelectedSlots.candidates),
      createOrder: createPerDiem,
    };
    const selectedDays = this.scheduleSelectedSlots.candidates[0]?.days;

    if(
      this.scheduleSelectedSlots.candidates.length === 1 &&
      selectedDays?.length === 1 &&
      selectedDays[0]?.scheduleType !== ScheduleType.Book
    ) {
      deleteScheduleRequest.startDateTime = selectedDays[0].startTime;
      deleteScheduleRequest.endDateTime = selectedDays[0].endTime;
    }

    this.scheduleApiService.deleteSchedule(deleteScheduleRequest).pipe(
      catchError((error: HttpErrorResponse) => this.createScheduleService.handleError(error)),
      takeUntil(this.componentDestroy())
    ).subscribe(() => {
      this.createScheduleService.closeSideBarEvent.next(false);
      this.store.dispatch(new ShowToast(MessageTypes.Success, RECORD_MODIFIED));
    });
  }

  closeSchedule(): void {
   if (this.scheduleForm?.touched && this.scheduleType !== ScheduleItemType.OpenPositions) {
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
    this.sideBarSettings.showOpenPositions = this.scheduleType !== ScheduleItemType.OpenPositions;
    this.cdr.markForCheck();
  }

  hideScheduleForm(): void {
    this.sideBarSettings.showScheduleForm = false;
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
    this.sideBarSettings.replacementOrderDialogOpen = false;
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
    this.sideBarSettings.replacementOrderDialogOpen = true;
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
        break;
      case ScheduleItemType.OpenPositions:
        this.scheduleFormConfig = OpenPositionsConfig;
        this.scheduleForm = this.createScheduleService.createOpenPositionsForm();
        this.openPositionService.setOpenPosition('shiftTime', null);
        this.getOpenPositions();
        this.setShiftTimeState();
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

  private setShiftTimeState(): void {
    combineLatest([
      this.scheduleForm.get(StartTimeField)?.valueChanges as Observable<Date>,
      this.scheduleForm.get(EndTimeField)?.valueChanges as Observable<Date>,
    ]).pipe(
      takeUntil(this.componentDestroy()),
    ).subscribe(([startTime, endTime]: [Date, Date]) => {
      const shiftTime = `${DateTimeHelper.toUtcFormat(startTime)}/${DateTimeHelper.toUtcFormat(endTime)}`;
      this.openPositionService.setOpenPosition('shiftTime', shiftTime);
    });
  }

  private getOpenPositions(): void {
    if(this.scheduleType === ScheduleItemType.OpenPositions) {
      this.scheduleApiService.getOpenPositions(
        this.createScheduleService.createOpenPositionsParams(this.scheduleSelectedSlots.dates)
      ).pipe(
        tap((positions: OpenPositionsList[]) => {
          this.openPositionService.setOpenPosition('initialPositions', positions);
        }),
        takeUntil(this.componentDestroy()),
      ).subscribe();
    }
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

  private watchForControls(): void {
    this.scheduleForm.get('orientated')?.valueChanges.pipe(
      takeUntil(this.componentDestroy())
    ).subscribe((value: boolean) => {
      this.createScheduleService.hideToggleControls(this.scheduleFormConfig, !value);
      this.cdr.markForCheck();
    });
  }

  private watchForScheduleType(): void {
    this.scheduleTypesControl.valueChanges.pipe(
      takeUntil(this.componentDestroy())
    ).subscribe((type: number) => {
      this.scheduleType = type;
    });
  }

  private closeSideBar(): void {
    this.openPositionService.clearOpenPositionState();
    this.sideBarSettings.showOpenPositions = true;
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
    const scheduleFiltersData = this.scheduleFiltersService.getScheduleFiltersData();
    this.scheduleToBook = this.createScheduleService.createBooking(
      this.scheduleForm,
      this.scheduleItemsComponent.scheduleItems,
      this.customShiftId,
      scheduleFiltersData?.filters?.skillIds || [],
      scheduleFiltersData?.filters?.departmentsIds || [],
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
    zip(this.getShifts(), this.getUnavailabilityReasons())
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
