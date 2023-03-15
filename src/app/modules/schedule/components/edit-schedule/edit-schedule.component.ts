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
import { catchError, filter, map, Observable, switchMap, take, takeUntil, tap, zip } from 'rxjs';

import { FieldType } from '@core/enums';
import { DateTimeHelper, DestroyDialog } from '@core/helpers';
import { CustomFormGroup, DropdownOption, Permission } from '@core/interface';
import { GlobalWindow } from '@core/tokens';
import { DatePickerLimitations } from '@shared/components/icon-multi-date-picker/icon-multi-date-picker.interface';
import { CANCEL_CONFIRM_TEXT, DELETE_CONFIRM_TITLE, RECORD_MODIFIED } from '@shared/constants';
import { MessageTypes } from '@shared/enums/message-types';
import { OrganizationStructure } from '@shared/models/organization.model';
import { ScheduleShift } from '@shared/models/schedule-shift.model';
import { Skill } from '@shared/models/skill.model';
import { ConfirmService } from '@shared/services/confirm.service';
import { ShiftsService } from '@shared/services/shift.service';
import { getHoursMinutesSeconds, getTime } from '@shared/utils/date-time.utils';
import { ScheduleFormSourceKeys } from 'src/app/modules/schedule/constants';
import { ScheduleType } from 'src/app/modules/schedule/enums';
import { ShowToast } from 'src/app/store/app.actions';
import { GetScheduleTabItems, GetShiftHours, MapToDropdownOptions, ScheduleFilterHelper } from '../../helpers';
import { ScheduledItem, ScheduleFilterStructure, ScheduleItem } from '../../interface';
import { ScheduleApiService, ScheduleFiltersService } from '../../services';
import { EditScheduleFormSourceKeys, EditScheduleSourcesMap, ScheduledShiftFormConfig } from './edit-schedule.constants';
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
  @Input() set scheduledShift(scheduledItem: ScheduledItem) {
    this.scheduledItem = scheduledItem;
    this.shiftTabs = GetScheduleTabItems(scheduledItem.schedule.daySchedules);
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
    this.createScheduleForm();
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

  setInitData(): void {
    zip(this.getScheduleFilterStructure(), this.getShifts())
      .pipe(takeUntil(this.componentDestroy()))
      .subscribe(() => this.selectScheduledItem(0));
  }

  selectScheduledItem(index: number): void {
    this.selectedDaySchedule = this.scheduledItem.schedule.daySchedules[index];

    // TODO: remove when edit availability is implemented
    if (this.selectedDaySchedule.scheduleType !== ScheduleType.Book) {
      this.editScheduleService.handleError({ error: { detail: 'Not implemented' } } as HttpErrorResponse);
      this.scheduleForm.reset();
      return;
    }

    const patchData = {
      date: this.scheduledItem.schedule.date,
      shiftId: this.selectedDaySchedule.shiftId || this.customShiftId,
    } as EditSchedule.ScheduledShiftForm;

    if (this.selectedDaySchedule.scheduleType === ScheduleType.Book && this.selectedDaySchedule.orderMetadata) {
      patchData.regionId = this.selectedDaySchedule.orderMetadata.regionId;
    }

    if (!this.selectedDaySchedule.shiftId) {
      this.setTimeForCustomShift();
    }

    this.scheduleForm.patchValue(patchData);
  }

  selectCustomShift(): void {
    this.scheduleForm.get('shiftId')?.setValue(this.customShiftId);
  }

  setHours(): void {
    const startTimeDate = this.scheduleForm.get('startTime')?.value;
    const endTimeDate = this.scheduleForm.get('endTime')?.value;

    if (startTimeDate && endTimeDate) {
      this.scheduleForm.get('hours')?.setValue(GetShiftHours(startTimeDate, endTimeDate));
    }
  }

  saveSchedule(): void {
    if (this.scheduleForm.invalid) {
      this.scheduleForm.markAllAsTouched();
      return;
    }

    this.updateScheduledShift();
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

  private watchForShiftControl(): void {
    this.scheduleForm.get('shiftId')?.valueChanges
      .pipe(
        map((shiftId: number) => this.scheduleShifts.find((shift: ScheduleShift) => shift.id === shiftId)),
        filter(Boolean),
        takeUntil(this.componentDestroy()),
      )
      .subscribe((shift: ScheduleShift) => {
        const [startH, startM, startS] = getHoursMinutesSeconds(shift.startTime);
        const [endH, endM, endS] = getHoursMinutesSeconds(shift.endTime);
        const startTime = new Date();
        const endTime = new Date();
        startTime.setHours(startH, startM, startS);
        endTime.setHours(endH, endM, endS);

        this.scheduleForm.patchValue({ startTime, endTime });
        this.setHours();
      });
  }

  private watchForRegionControls(): void {
    this.scheduleForm.get('regionId')?.valueChanges.pipe(
      takeUntil(this.componentDestroy())
    ).subscribe((value: number) => {
      this.scheduleFormSourcesMap[ScheduleFormSourceKeys.Locations] = this.scheduleFiltersService
        .getSelectedLocatinOptions(this.scheduleFilterStructure, [value]);
      this.scheduleForm.patchValue({ locationId: this.selectedDaySchedule?.orderMetadata?.locationId || null });
      this.cdr.markForCheck();
    });

    this.scheduleForm.get('locationId')?.valueChanges.pipe(
      takeUntil(this.componentDestroy())
    ).subscribe((value: number) => {
      this.scheduleFormSourcesMap[ScheduleFormSourceKeys.Departments] = this.scheduleFiltersService
        .getSelectedDepartmentOptions(this.scheduleFilterStructure, [value], false);
      this.scheduleForm.patchValue({ departmentId: this.selectedDaySchedule?.orderMetadata?.departmentId || null });
      this.cdr.markForCheck();
    });

    this.scheduleForm.get('departmentId')?.valueChanges.pipe(
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
    });
  }

  private updateScheduledShift(): void {
    const { departmentId, skillId, shiftId, startTime, endTime, date } = this.scheduleForm.getRawValue();
    const schedule: EditSchedule.ScheduledShift = {
      scheduleId: this.selectedDaySchedule.id,
      departmentId,
      skillId,
      shiftId: shiftId === this.customShiftId ? null : shiftId,
      date: DateTimeHelper.setInitHours(DateTimeHelper.toUtcFormat(date)),
      startTime: getTime(startTime),
      endTime: getTime(endTime),
      createOrder: this.createPerDiemOrderControl.value,
    };

    this.scheduleApiService.updateScheduledShift(schedule).pipe(
      catchError((error: HttpErrorResponse) => this.editScheduleService.handleError(error)),
      takeUntil(this.componentDestroy())
    ).subscribe(() => {
      this.updateScheduleGrid.emit();
      this.scheduleForm.markAsUntouched();
      this.closeDialog();
      this.store.dispatch(new ShowToast(MessageTypes.Success, RECORD_MODIFIED));
    });
  }

  private createScheduleForm(): void {
    this.scheduleForm = this.editScheduleService.createScheduledShiftForm();
    this.watchForShiftControl();
    this.watchForRegionControls();
  }

  private setTimeForCustomShift(): void {
    this.scheduleForm.patchValue({
      startTime: DateTimeHelper.convertDateToUtc(this.selectedDaySchedule.startDate),
      endTime: DateTimeHelper.convertDateToUtc(this.selectedDaySchedule.endDate),
    });
    this.setHours();
  }
}
