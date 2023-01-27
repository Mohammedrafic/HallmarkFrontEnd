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
import { catchError, filter, map, Subscription, take, takeUntil, tap } from 'rxjs';

import { FieldType } from '@core/enums';
import { DestroyDialog } from '@core/helpers';
import { CustomFormGroup, DropdownOption } from '@core/interface';
import { GlobalWindow } from '@core/tokens';
import { CANCEL_CONFIRM_TEXT, DELETE_CONFIRM_TITLE, RECORD_ADDED, RECORDS_ADDED } from '@shared/constants';
import { DatePickerLimitations } from '@shared/components/icon-multi-date-picker/icon-multi-date-picker.interface';
import { ScheduleShift } from '@shared/models/schedule-shift.model';
import { UnavailabilityReason } from '@shared/models/unavailability-reason.model';
import { ConfirmService } from '@shared/services/confirm.service';
import { MessageTypes } from '@shared/enums/message-types';
import { ShiftsService } from '@shared/services/shift.service';
import { convertMsToTime, getHoursMinutesSeconds, getTime } from '@shared/utils/date-time.utils';
import {
  AvailabilityFormConfig,
  ScheduleFormSourceKeys,
  ScheduleTypeNumber,
  ScheduleTypes,
  UnavailabilityFormConfig,
} from '../../constants';
import { CreateScheduleService } from '../../services/create-schedule.service';
import { ShowToast } from '../../../../store/app.actions';
import { ScheduleItemsComponent } from '../schedule-items/schedule-items.component';
import { ScheduleApiService } from '../../services';
import * as ScheduleInt from '../../interface';

@Component({
  selector: 'app-create-schedule',
  templateUrl: './create-schedule.component.html',
  styleUrls: ['./create-schedule.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateScheduleComponent extends DestroyDialog implements OnInit {
  @ViewChild(ScheduleItemsComponent) scheduleItemsComponent: ScheduleItemsComponent;

  @Input() scheduleSelectedSlots: ScheduleInt.ScheduleSelectedSlots;
  @Input() datePickerLimitations: DatePickerLimitations;
  @Input() set scheduleData(page: ScheduleInt.ScheduleModelPage | null) {
    if (page) {
      this.createScheduleService.scheduleData = page.items;
    }
  }

  @Output() updateScheduleGrid: EventEmitter<void> = new EventEmitter<void>();

  readonly targetElement: HTMLBodyElement = this.globalWindow.document.body as HTMLBodyElement;
  readonly scheduleTypes: ScheduleInt.ScheduleTypeRadioButton[] = ScheduleTypes;
  readonly scheduleTypeNumberEnum = ScheduleTypeNumber;
  readonly FieldTypes = FieldType;
  readonly scheduleTypesControl: FormControl = new FormControl(this.scheduleTypeNumberEnum.Unavailability); // TODO: change to Book when it is implemented
  readonly dropDownFields = { text: 'text', value: 'value' };
  readonly scheduleFormSourcesMap: ScheduleInt.ScheduleFormSource = {
    [ScheduleFormSourceKeys.Shifts]: [],
    [ScheduleFormSourceKeys.Reasons]: [],
  };

  scheduleForm: CustomFormGroup<ScheduleInt.ScheduleForm>;
  scheduleFormConfig: ScheduleInt.ScheduleFormConfig;
  scheduleTypeNumber: ScheduleTypeNumber;
  showScheduleForm = true;

  private readonly customShiftId = -1;
  private shiftControlSubscription: Subscription | null;
  private scheduleShifts: ScheduleShift[] = [];

  constructor(
    @Inject(GlobalWindow) protected readonly globalWindow: WindowProxy & typeof globalThis,
    private createScheduleService: CreateScheduleService,
    private scheduleApiService: ScheduleApiService,
    private confirmService: ConfirmService,
    private shiftsService: ShiftsService,
    private cdr: ChangeDetectorRef,
    private store: Store,
  ) {
    super();
  }

  ngOnInit(): void {
    this.watchForCloseStream();
    this.getUnavailabilityReasons();
    this.getShifts();
    this.updateScheduleDialogConfig(ScheduleTypeNumber.Unavailability); // TODO: change to Book when it is implemented
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
          this.closeDialog();
        });
    } else {
      this.closeDialog();
    }
  }

  changeScheduleType(event: ChangeArgs): void {
    this.updateScheduleDialogConfig(event.value as unknown as ScheduleTypeNumber);
  }

  hideScheduleForm(): void {
    this.showScheduleForm = false;
  }

  selectCustomShift(): void {
    this.scheduleForm.get('shiftId')?.setValue(this.customShiftId);
  }

  setHours(): void {
    const startTimeDate =  this.scheduleForm.get('startTime')?.value;
    const endTimeDate =  this.scheduleForm.get('endTime')?.value;

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

    const { shiftId, startTime, endTime, unavailabilityReasonId = null } = this.scheduleForm.getRawValue();
    const schedule: ScheduleInt.Schedule = {
      employeeScheduledDays: this.createScheduleService
        .getEmployeeScheduledDays(this.scheduleItemsComponent.scheduleItems, startTime, endTime),
      scheduleType: this.scheduleTypesControl.value,
      startTime: getTime(startTime),
      endTime: getTime(endTime),
      unavailabilityReasonId,
      shiftId: shiftId !== this.customShiftId ? shiftId : null,
    };
    const successMessage = schedule.employeeScheduledDays.length === 1
      && schedule.employeeScheduledDays[0].scheduledDays.length === 1
        ? RECORD_ADDED
        : RECORDS_ADDED;

    this.scheduleApiService.createSchedule(schedule)
      .pipe(
        catchError((error: HttpErrorResponse) => this.createScheduleService.handleError(error)),
        takeUntil(this.componentDestroy())
      )
      .subscribe(() => {
        this.updateScheduleGrid.emit();
        this.scheduleForm.markAsUntouched();
        this.store.dispatch(new ShowToast(MessageTypes.Success, successMessage));
      });
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

  private updateScheduleDialogConfig(scheduleTypeMode: ScheduleTypeNumber): void {
    this.scheduleTypeNumber = scheduleTypeMode;

    switch (this.scheduleTypeNumber) {
      case ScheduleTypeNumber.Book:
        // TODO: handle when Book functionality is implemented
        break;
      case ScheduleTypeNumber.Unavailability:
        this.scheduleFormConfig = UnavailabilityFormConfig;
        this.scheduleForm = this.createScheduleService.createUnavailabilityForm();
        break;
      case ScheduleTypeNumber.Availability:
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
}
