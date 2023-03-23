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
} from '@angular/core';
import { FormControl } from '@angular/forms';

import { Store } from '@ngxs/store';
import { ChangeEventArgs } from '@syncfusion/ej2-angular-calendars';
import { catchError, filter, map, Observable, Subscription, switchMap, take, takeUntil, tap, zip } from 'rxjs';

import { FieldType } from '@core/enums';
import { DateTimeHelper, DestroyDialog } from '@core/helpers';
import { CustomFormGroup, DropdownOption, Permission } from '@core/interface';
import { GlobalWindow } from '@core/tokens';
import { UnavailabilityReason } from '@shared/models/unavailability-reason.model';
import { DatePickerLimitations } from '@shared/components/icon-multi-date-picker/icon-multi-date-picker.interface';
import { CANCEL_CONFIRM_TEXT, DELETE_CONFIRM_TITLE, RECORD_MODIFIED } from '@shared/constants';
import { MessageTypes } from '@shared/enums/message-types';
import { OrganizationStructure } from '@shared/models/organization.model';
import { ScheduleShift } from '@shared/models/schedule-shift.model';
import { Skill } from '@shared/models/skill.model';
import { ConfirmService } from '@shared/services/confirm.service';
import { ShiftsService } from '@shared/services/shift.service';
import { getTime } from '@shared/utils/date-time.utils';
import { ScheduleFormSourceKeys } from 'src/app/modules/schedule/constants';
import { ScheduleType } from 'src/app/modules/schedule/enums';
import { ShowToast } from 'src/app/store/app.actions';
import {
  GetScheduleTabItems,
  GetShiftHours,
  GetShiftTimeControlsValue,
  MapToDropdownOptions,
  ScheduleFilterHelper,
} from '../../helpers';
import { ScheduledItem, ScheduleFilterStructure, ScheduleItem } from '../../interface';
import { ScheduleApiService, ScheduleFiltersService } from '../../services';
import {
  EditScheduleFormSourceKeys,
  EditScheduleSourcesMap,
  ScheduledAvailabilityFormConfig,
  ScheduledShiftFormConfig,
  ScheduledUnavailabilityFormConfig,
} from './edit-schedule.constants';
import * as EditSchedule from './edit-schedule.interface';
import { EditScheduleService } from './edit-schedule.service';

@Component({
  selector: 'app-edit-schedule',
  templateUrl: './edit-schedule.component.html',
  styleUrls: ['./edit-schedule.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditScheduleComponent extends DestroyDialog implements OnInit {
  @Input() datePickerLimitations: DatePickerLimitations;
  @Input() userPermission: Permission = {};
  @Input() set scheduledShift(scheduledItem: ScheduledItem | null) {
    if (scheduledItem && scheduledItem.schedule) {
      this.scheduledItem = scheduledItem;
      this.shiftTabs = GetScheduleTabItems(scheduledItem.schedule.daySchedules);
      this.selectScheduledItem(0);
    }
  }

  @Output() updateScheduleGrid: EventEmitter<void> = new EventEmitter<void>();

  readonly targetElement: HTMLBodyElement = this.globalWindow.document.body as HTMLBodyElement;
  readonly FieldTypes = FieldType;
  readonly dropDownFields = { text: 'text', value: 'value' };
  readonly scheduleFormSourcesMap: EditSchedule.EditScheduleFormSource = EditScheduleSourcesMap;
  readonly createPerDiemOrderControl: FormControl = new FormControl(false);

  scheduleForm: CustomFormGroup<EditSchedule.ScheduledShiftForm>;
  scheduleFormConfig: EditSchedule.EditScheduleFormConfig = ScheduledShiftFormConfig;
  shiftTabs: EditSchedule.ShiftTab[] = [];
  scheduledItem: ScheduledItem;

  private readonly customShiftId = -1;
  private scheduleShifts: ScheduleShift[] = [];
  private scheduleFilterStructure: ScheduleFilterStructure;
  private selectedDaySchedule: ScheduleItem;
  private hasInitData = false;
  private subscriptions: Record<string, Subscription | null> = {
    shiftId: null,
    regionId: null,
    locationId: null,
    departmentId: null,
  };

  constructor(
    @Inject(GlobalWindow) protected readonly globalWindow: WindowProxy & typeof globalThis,
    private editScheduleService: EditScheduleService,
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
          this.hasInitData = false;
        });
    } else {
      this.closeDialog();
      this.hasInitData = false;
    }
  }

  setInitData(): void {
    zip(this.getScheduleFilterStructure(), this.getShifts(), this.getUnavailabilityReasons())
      .pipe(takeUntil(this.componentDestroy()))
      .subscribe(() => {
        this.hasInitData = true;
        this.selectScheduledItem(0);
      });
  }

  selectScheduledItem(index: number): void {
    const patchData = {} as EditSchedule.ScheduledShiftForm;

    if (!this.hasInitData) {
      return;
    }

    this.selectedDaySchedule = this.scheduledItem.schedule.daySchedules[index];

    if (this.selectedDaySchedule.scheduleType === ScheduleType.Book) {
      this.scheduleFormConfig = ScheduledShiftFormConfig;
      this.scheduleForm = this.editScheduleService.createScheduledShiftForm();
      patchData.regionId = this.selectedDaySchedule.orderMetadata?.regionId;
      this.watchForRegionControls();
    }

    if (this.selectedDaySchedule.scheduleType === ScheduleType.Unavailability) {
      this.scheduleFormConfig = ScheduledUnavailabilityFormConfig;
      this.scheduleForm = this.editScheduleService.createScheduledUnavailabilityForm();
      patchData.unavailabilityReasonId = this.selectedDaySchedule.unavailabilityReasonId;
    }

    if (this.selectedDaySchedule.scheduleType === ScheduleType.Availability) {
      this.scheduleFormConfig = ScheduledAvailabilityFormConfig;
      this.scheduleForm = this.editScheduleService.createScheduledAvailabilityForm();
    }

    this.watchForShiftControl();
    patchData.date = DateTimeHelper.convertDateToUtc(this.scheduledItem.schedule.date);
    patchData.shiftId = this.selectedDaySchedule.shiftId || this.customShiftId;

    if (!this.selectedDaySchedule.shiftId) {
      this.setTimeForCustomShift();
    }

    this.scheduleForm.patchValue(patchData);
    this.cdr.markForCheck();
  }

  changeTimeControls(event: ChangeEventArgs, field: string): void {
    const shiftIdControl = this.scheduleForm.get('shiftId');
    const startTimeDate = field === 'startTime' ? event.value : this.scheduleForm.get('startTime')?.value;
    const endTimeDate = field === 'endTime' ? event.value : this.scheduleForm.get('endTime')?.value;

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

    this.updateScheduledShift();
  }

  deleteSchedule(): void {
    this.scheduleApiService.deleteSchedule(this.selectedDaySchedule.id, this.createPerDiemOrderControl.value).pipe(
      catchError((error: HttpErrorResponse) => this.editScheduleService.handleError(error)),
      takeUntil(this.componentDestroy())
    ).subscribe(() => {
      if (this.scheduledItem.schedule.daySchedules.length === 1) {
        this.closeDialog();
      }

      this.updateScheduleGrid.emit();
      this.scheduleForm.markAsUntouched();
      this.store.dispatch(new ShowToast(MessageTypes.Success, RECORD_MODIFIED));
    });
  }

  private setHours(
    startTimeDate: Date = this.scheduleForm.get('startTime')?.value,
    endTimeDate: Date = this.scheduleForm.get('endTime')?.value,
  ): void {
    if (startTimeDate && endTimeDate) {
      this.scheduleForm.get('hours')?.setValue(GetShiftHours(startTimeDate, endTimeDate));
    }
  }

  private getScheduleFilterStructure(): Observable<ScheduleFilterStructure> {
    return this.scheduleApiService.getEmployeesStructure(this.scheduledItem.candidate.id).pipe(
      map((structure: OrganizationStructure) => {
        return this.scheduleFiltersService.createFilterStructure(structure.regions);
      }),
      tap((structure: ScheduleFilterStructure) => {
        this.scheduleFilterStructure = { ...structure };
        this.scheduleFormSourcesMap[EditScheduleFormSourceKeys.Regions] = ScheduleFilterHelper
          .adaptRegionToOption(structure.regions);
      }),
    );
  }

  private getShifts(): Observable<DropdownOption[]> {
    return this.shiftsService.getAllShifts().pipe(
      catchError((error: HttpErrorResponse) => this.editScheduleService.handleError(error)),
      tap((shifts: ScheduleShift[]) => this.scheduleShifts = shifts),
      map((shifts: ScheduleShift[]) => MapToDropdownOptions(shifts)),
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
      catchError((error: HttpErrorResponse) => this.editScheduleService.handleError(error)),
      map((reasons: UnavailabilityReason[]) => MapToDropdownOptions(reasons)),
      tap(((reasons: DropdownOption[]) => {
        this.scheduleFormSourcesMap[EditScheduleFormSourceKeys.Reasons] = reasons;
      })),
    );
  }

  private watchForShiftControl(): void {
    this.unsubscribe('shiftId');
    this.subscriptions['shiftId'] = this.scheduleForm.get('shiftId')?.valueChanges
      .pipe(
        map((shiftId: number) => this.scheduleShifts.find((shift: ScheduleShift) => shift.id === shiftId)),
        filter(Boolean),
        takeUntil(this.componentDestroy()),
      )
      .subscribe((shift: ScheduleShift) => {
        this.scheduleForm.patchValue(GetShiftTimeControlsValue(shift.startTime, shift.endTime));
        this.setHours();
      }) || null;
  }

  private watchForRegionControls(): void {
    this.unsubscribe('regionId');
    this.subscriptions['regionId'] = this.scheduleForm.get('regionId')?.valueChanges.pipe(
      takeUntil(this.componentDestroy())
    ).subscribe((value: number) => {
      this.scheduleFormSourcesMap[ScheduleFormSourceKeys.Locations] = this.scheduleFiltersService
        .getSelectedLocatinOptions(this.scheduleFilterStructure, [value]);
      this.scheduleForm.patchValue({ locationId: this.selectedDaySchedule?.orderMetadata?.locationId || null });
      this.cdr.markForCheck();
    }) || null;

    this.unsubscribe('locationId');
    this.subscriptions['locationId'] = this.scheduleForm.get('locationId')?.valueChanges.pipe(
      takeUntil(this.componentDestroy())
    ).subscribe((value: number) => {
      this.scheduleFormSourcesMap[ScheduleFormSourceKeys.Departments] = this.scheduleFiltersService
        .getSelectedDepartmentOptions(this.scheduleFilterStructure, [value], false);
      this.scheduleForm.patchValue({ departmentId: this.selectedDaySchedule?.orderMetadata?.departmentId || null });
      this.cdr.markForCheck();
    }) || null;

    this.unsubscribe('departmentId');
    this.subscriptions['departmentId'] = this.scheduleForm.get('departmentId')?.valueChanges.pipe(
      filter(Boolean),
      switchMap((value: number) => this.scheduleApiService.getSkillsByEmployees(this.scheduledItem.candidate.id, value)),
      takeUntil(this.componentDestroy())
    ).subscribe((skills: Skill[]) => {
      const skillOption = ScheduleFilterHelper.adaptMasterSkillToOption(skills);
      this.scheduleFormSourcesMap[ScheduleFormSourceKeys.Skills] = skillOption;
      this.scheduleForm?.patchValue({
        skillId: this.selectedDaySchedule?.orderMetadata?.primarySkillId || skillOption[0]?.value,
      });
      this.cdr.markForCheck();
    }) || null;
  }

  private updateScheduledShift(): void {
    const { departmentId, skillId, shiftId, startTime, endTime, date, unavailabilityReasonId } =
      this.scheduleForm.getRawValue();
    const schedule: EditSchedule.ScheduledShift = {
      scheduleId: this.selectedDaySchedule.id,
      unavailabilityReasonId,
      departmentId,
      skillId,
      shiftId: shiftId === this.customShiftId ? null : shiftId,
      date: DateTimeHelper.setInitHours(DateTimeHelper.toUtcFormat(date)),
      startTime: getTime(startTime),
      endTime: getTime(endTime),
      createOrder: this.createPerDiemOrderControl.value,
    };

    this.scheduleApiService.updateScheduledShift(schedule, this.selectedDaySchedule.scheduleType).pipe(
      catchError((error: HttpErrorResponse) => this.editScheduleService.handleError(error)),
      takeUntil(this.componentDestroy())
    ).subscribe(() => {
      if (this.scheduledItem.schedule.daySchedules.length === 1) {
        this.closeDialog();
      }

      this.updateScheduleGrid.emit();
      this.scheduleForm.markAsUntouched();
      this.store.dispatch(new ShowToast(MessageTypes.Success, RECORD_MODIFIED));
    });
  }

  private setTimeForCustomShift(): void {
    this.scheduleForm.patchValue({
      startTime: DateTimeHelper.convertDateToUtc(this.selectedDaySchedule.startDate),
      endTime: DateTimeHelper.convertDateToUtc(this.selectedDaySchedule.endDate),
    });
    this.setHours();
  }

  private unsubscribe(subscription: string): void {
    if (this.subscriptions[subscription]) {
      this.subscriptions[subscription]?.unsubscribe();
      this.subscriptions[subscription] = null;
    }
  }
}
