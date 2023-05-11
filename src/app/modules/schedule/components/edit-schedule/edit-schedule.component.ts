import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  NgZone,
  OnInit,
  Output,
  TrackByFunction,
  ViewChild,
} from '@angular/core';
import { FormControl } from '@angular/forms';

import { Store } from '@ngxs/store';
import { ChangeEventArgs } from '@syncfusion/ej2-angular-calendars';
import { catchError, EMPTY, filter, map, Observable, Subscription, switchMap, take, takeUntil, tap, zip } from 'rxjs';

import { OutsideZone } from '@core/decorators';
import { FieldType } from '@core/enums';
import { DateTimeHelper, Destroyable } from '@core/helpers';
import { CustomFormGroup, DropdownOption, Permission } from '@core/interface';
import { GlobalWindow } from '@core/tokens';
import { DatePickerLimitations } from '@shared/components/icon-multi-date-picker/icon-multi-date-picker.interface';
import { DELETE_CONFIRM_TITLE, RECORD_MODIFIED, RECORDS_ADDED, UNSAVED_TABS_TEXT } from '@shared/constants';
import { MessageTypes } from '@shared/enums/message-types';
import { OrganizationStructure } from '@shared/models/organization.model';
import { ScheduleShift } from '@shared/models/schedule-shift.model';
import { Skill } from '@shared/models/skill.model';
import { UnavailabilityReason } from '@shared/models/unavailability-reason.model';
import { ConfirmService } from '@shared/services/confirm.service';
import { ShiftsService } from '@shared/services/shift.service';
import { getTime } from '@shared/utils/date-time.utils';
import { ScheduleFormSourceKeys, ScheduleItemType, ScheduleTypesForEditBar } from 'src/app/modules/schedule/constants';
import { ScheduleType } from 'src/app/modules/schedule/enums';
import { ShowToast } from 'src/app/store/app.actions';
import { UserState } from 'src/app/store/user.state';
import {
  GetScheduleTabItems,
  GetShiftHours,
  GetShiftTimeControlsValue,
  HasTimeControlValues,
  MapShiftToDropdownOptions,
  MapToDropdownOptions,
  ScheduleFilterHelper,
} from '../../helpers';
import {
  DeleteScheduleRequest,
  Schedule,
  ScheduleBook,
  ScheduleBookingErrors,
  ScheduledItem,
  ScheduleFilterStructure,
  ScheduleFormConfig,
  ScheduleItem,
} from '../../interface';
import { CreateScheduleService, ScheduleApiService, ScheduleFiltersService } from '../../services';
import { BookingsOverlapsRequest, BookingsOverlapsResponse } from '../replacement-order-dialog/replacement-order.interface';
import {
  EditScheduleFormSourceKeys,
  EditScheduleSourcesMap,
  NewShiftFormConfig,
  RemoveButtonTitleMap,
  ScheduledAvailabilityFormConfig,
  ScheduledShiftFormConfig,
  ScheduledUnavailabilityFormConfig,
  EditSchedulePermissionsMap,
} from './edit-schedule.constants';
import * as EditSchedule from './edit-schedule.interface';
import { EditScheduleFormFieldConfig, ShiftTab } from './edit-schedule.interface';
import { EditScheduleService } from './edit-schedule.service';

@Component({
  selector: 'app-edit-schedule',
  templateUrl: './edit-schedule.component.html',
  styleUrls: ['./edit-schedule.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditScheduleComponent extends Destroyable implements OnInit {
  @ViewChild('tabs') private tabs: ElementRef;

  @Input() isEmployee = false;
  @Input() datePickerLimitations: DatePickerLimitations;
  @Input() userPermission: Permission = {};
  @Input() set scheduledShift(scheduledItem: ScheduledItem | null) {
    this.changeScheduledShift(scheduledItem);
  }

  @Output() updateScheduleGrid: EventEmitter<void> = new EventEmitter<void>();

  readonly targetElement: HTMLBodyElement = this.globalWindow.document.body as HTMLBodyElement;
  readonly FieldTypes = FieldType;
  readonly dropDownFields = { text: 'text', value: 'value' };
  readonly scheduleFormSourcesMap: EditSchedule.EditScheduleFormSource = EditScheduleSourcesMap;
  readonly createPerDiemOrderControl: FormControl = new FormControl(false);
  readonly scheduleType = ScheduleType;
  readonly removeButtonTitleMap = RemoveButtonTitleMap;
  readonly scheduleTypesControl: FormControl = new FormControl(ScheduleItemType.Book);

  hasEditPermissions = false;
  canEmployeeEdit = false;
  showLockedMessage = false;
  scheduleForm: CustomFormGroup<EditSchedule.ScheduledShiftForm>;
  scheduleFormConfig: EditSchedule.EditScheduleFormConfig = ScheduledShiftFormConfig(this.hasEditPermissions);
  scheduleTypes = ScheduleTypesForEditBar;
  shiftTabs: EditSchedule.ShiftTab[] = [];
  scheduledItem: ScheduledItem;
  scheduleItemType = ScheduleItemType.Book;
  selectedDaySchedule: ScheduleItem;
  selectedDayScheduleIndex: number;
  newScheduleIndex: number;
  isCreateMode = false;
  trackByTabs: TrackByFunction<ShiftTab> = (_: number, tab: ShiftTab) => tab.id;
  replacementOrderDialogOpen = false;
  replacementOrderDialogData: BookingsOverlapsResponse[] = [];

  private readonly customShiftId = -1;
  private readonly newScheduleId = -1;
  private isShiftOriented: boolean;
  private scheduleShifts: ScheduleShift[] = [];
  private scheduleFilterStructure: ScheduleFilterStructure;
  private hasInitData = false;
  private scheduleToBook: ScheduleBook | null;
  private unavailabilityToSave: Schedule | null;
  private subscriptions: Record<string, Subscription | null> = {
    shiftId: null,
    regionId: null,
    locationId: null,
    departmentId: null,
    orientated: null,
    date: null,
    meal: null,
    oncall: null,
  };

  constructor(
    @Inject(GlobalWindow) protected readonly globalWindow: WindowProxy & typeof globalThis,
    private readonly ngZone: NgZone,
    private editScheduleService: EditScheduleService,
    private createScheduleService: CreateScheduleService,
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
    this.setScheduleTypes();
    this.setInitData();
  }

  closeSchedule(): void {
    if (this.scheduleForm?.touched) {
      this.confirmService.confirm(
        UNSAVED_TABS_TEXT,
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
          this.closeSideBar();
        });
    } else {
      this.closeSideBar();
    }
  }

  setInitData(): void {
    zip(this.getScheduleFilterStructure(), this.getShifts(), this.getUnavailabilityReasons())
      .pipe(takeUntil(this.componentDestroy()))
      .subscribe(() => {
        this.hasInitData = true;
        this.selectScheduledItem(this.scheduledItem.schedule.daySchedules[0]);
      });
  }

  changeTab(scheduleIndex: number): void {
    const schedule = this.scheduledItem.schedule.daySchedules[scheduleIndex];

    if (this.selectedDayScheduleIndex === this.newScheduleIndex && scheduleIndex !== this.newScheduleIndex) {
      this.removeNewTab();
    }

    if (schedule) {
      this.selectScheduledItem(schedule, scheduleIndex);
    }
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

  changeScheduleType(type: ScheduleItemType): void {
    const patchData = {} as EditSchedule.ScheduledShiftForm;

    this.scheduleItemType = type;

    if (type === ScheduleItemType.Book) {
      this.scheduleFormConfig = NewShiftFormConfig();
      this.scheduleForm = this.editScheduleService.createNewShiftForm();
      this.watchForToggleControls();
    }

    if (type === ScheduleItemType.Unavailability) {
      this.scheduleFormConfig = ScheduledUnavailabilityFormConfig(this.isCreateMode, true);
      this.scheduleForm = this.editScheduleService.createScheduledUnavailabilityForm();
    }

    if (type === ScheduleItemType.Availability) {
      this.scheduleFormConfig = ScheduledAvailabilityFormConfig(this.isCreateMode, true);
      this.scheduleForm = this.editScheduleService.createScheduledAvailabilityForm();
    }

    this.watchForShiftControl();
    this.watchForDateControl();

    patchData.date = DateTimeHelper.convertDateToUtc(this.scheduledItem.schedule.date);

    this.scheduleForm.patchValue(patchData);
    this.cdr.markForCheck();
  }

  addNewSchedule(): void {
    this.shiftTabs = [...this.shiftTabs, { id: this.newScheduleId, title: 'New', subTitle: 'Add scheduling' }];
    this.newScheduleIndex = this.shiftTabs.length - 1;
    this.selectedDayScheduleIndex = this.newScheduleIndex;
    this.isCreateMode = true;
    this.showLockedMessage = false;
    this.createFormForNewTab();
    this.scrollToNewScheduleTab();
  }

  closeReplacementOrderDialog(): void {
    this.replacementOrderDialogOpen = false;
    this.cdr.markForCheck();
  }

  saveSchedule(): void {
    if (this.scheduleForm.invalid) {
      this.scheduleForm.markAllAsTouched();
      return;
    }

    if (!this.isCreateMode && this.selectedDaySchedule.scheduleType !== ScheduleType.Unavailability) {
      this.updateScheduledShiftHandler();
      return;
    }

    if (
      (this.selectedDaySchedule.scheduleType === ScheduleType.Unavailability && !this.isCreateMode)
      || (this.scheduleItemType === ScheduleItemType.Unavailability && this.isCreateMode)
    ) {
      this.checkUnavailabilityOverlaps();
      return;
    }

    if (this.scheduleItemType === ScheduleItemType.Book) {
      this.checkBookingsOverlaps();
      return;
    }

    this.createAvailability();
  }

  deleteSchedule(): void {
    const deleteScheduleRequest: DeleteScheduleRequest = {
      ids: [this.selectedDaySchedule.id],
      createOrder: this.createPerDiemOrderControl.value,
    };

    if (this.selectedDaySchedule.scheduleType !== ScheduleType.Book) {
      deleteScheduleRequest.startDateTime = this.selectedDaySchedule.startDate;
      deleteScheduleRequest.endDateTime = this.selectedDaySchedule.endDate;
    }

    if (!this.isCreateMode && this.selectedDaySchedule.scheduleType !== ScheduleType.Unavailability) {
      this.deleteScheduleHandler(deleteScheduleRequest);
    } else {
      this.performDelete(deleteScheduleRequest);
    }
  }

  saveNewEvent(createOrder: boolean): void {
    if (this.unavailabilityToSave) {
      this.unavailabilityToSave.createOrder = createOrder;
      this.createUnavailability()
        .pipe(takeUntil(this.componentDestroy()))
        .subscribe(() => this.handleSuccessAdding());

      return;
    }

    if (this.scheduleToBook) {
      this.scheduleToBook.createOrder = createOrder;
      this.createBookSchedule()
        .pipe(takeUntil(this.componentDestroy()))
        .subscribe(() => this.handleSuccessAdding());
    }
  }

  private performDelete(deleteScheduleRequest: DeleteScheduleRequest): void {
    this.scheduleApiService.deleteSchedule(deleteScheduleRequest).pipe(
      catchError((error: HttpErrorResponse) => this.editScheduleService.handleError(error)),
      takeUntil(this.componentDestroy())
    ).subscribe(() => {
      if (this.scheduledItem.schedule.daySchedules.length === 1) {
        this.closeSideBar();
      }

      this.updateScheduleGrid.emit();
      this.scheduleForm.markAsUntouched();
      this.store.dispatch(new ShowToast(MessageTypes.Success, RECORD_MODIFIED));
    });
  }

  private deleteScheduleHandler(deleteScheduleRequest: DeleteScheduleRequest): void {
    if (this.isShiftOriented) {
      this.createScheduleService.confirmEditing().pipe(
        filter(Boolean),
        takeUntil(this.componentDestroy())
      ).subscribe(() => {
        this.performDelete(deleteScheduleRequest);
      });
    } else {
      this.performDelete(deleteScheduleRequest);
    }
  }

  private ifShiftEdited(): boolean {
    return !!(this.isShiftOriented &&
      (this.scheduleForm.get('departmentId')?.dirty || this.scheduleForm.get('date')?.dirty || this.scheduleForm.get('skillId')?.dirty));
  }

  private updateScheduledShiftHandler(): void {
    if (this.ifShiftEdited()) {
      this.createScheduleService.confirmEditing().pipe(
        filter(Boolean),
        takeUntil(this.componentDestroy())
      ).subscribe(() => {
        this.updateScheduledShift();
      });
    } else {
      this.updateScheduledShift();
    }
  }

  private setHours(
    startTimeDate: Date = this.scheduleForm.get('startTime')?.value,
    endTimeDate: Date = this.scheduleForm.get('endTime')?.value,
  ): void {
    if (startTimeDate && endTimeDate) {
      const meal = this.scheduleForm.get('meal')?.value;
      this.scheduleForm.get('hours')?.setValue(GetShiftHours(startTimeDate, endTimeDate, meal));
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
        tap((shiftId: number) => {
          this.createScheduleService.setOnCallControlValue(this.scheduleForm, shiftId, this.scheduleShifts);
          this.updateScheduleFormConfig(shiftId === this.customShiftId);
        }),
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
      switchMap((value: number) => this.scheduleApiService.getSkillsByEmployees(value, this.scheduledItem.candidate.id)),
      takeUntil(this.componentDestroy())
    ).subscribe((skills: Skill[]) => {
      const skillOption = ScheduleFilterHelper.adaptMasterSkillToOption(skills);
      const skillId = this.selectedDaySchedule?.orderMetadata?.primarySkillId && !this.isCreateMode
        ? this.selectedDaySchedule?.orderMetadata?.primarySkillId
        : skillOption[0]?.value;
      this.scheduleFormSourcesMap[ScheduleFormSourceKeys.Skills] = skillOption;
      this.scheduleForm?.patchValue({ skillId });
      this.cdr.markForCheck();
    }) || null;
  }

  private watchForToggleControls(): void {
    this.unsubscribe('orientated');
    this.subscriptions['orientated'] = this.scheduleForm.get('orientated')?.valueChanges.pipe(
      takeUntil(this.componentDestroy())
    ).subscribe((value: boolean) => {
      this.createScheduleService.hideToggleControls(this.scheduleFormConfig as ScheduleFormConfig, !value);
      this.cdr.markForCheck();
    }) || null;

    this.unsubscribe('meal');
    this.subscriptions['meal'] = this.scheduleForm.get('meal')?.valueChanges.pipe(
      filter(() => {
        return HasTimeControlValues(this.scheduleForm);
      }),
      takeUntil(this.componentDestroy())
    ).subscribe(() => {
      this.setHours();

      this.cdr.markForCheck();
    }) || null;

    this.unsubscribe('oncall');
    this.subscriptions['oncall'] = this.scheduleForm.get('oncall')?.valueChanges.pipe(
      takeUntil(this.componentDestroy())
    ).subscribe((value: boolean) => {
      const mealControl = this.scheduleForm.get('meal');

      if(value) {
        mealControl?.patchValue(false);
        mealControl?.disable();
      } else {
        mealControl?.enable();
      }
      this.cdr.markForCheck();
    }) || null;
  }

  private watchForDateControl(): void {
    this.unsubscribe('date');
    this.subscriptions['date'] = this.scheduleForm.get('date')?.valueChanges.pipe(
      takeUntil(this.componentDestroy())
    ).subscribe(() => {
      this.checkCandidateIsOrientedField();
      this.cdr.markForCheck();
    }) || null;
  }

  private updateScheduledShift(): void {
    const { departmentId, skillId, shiftId, startTime, endTime, date,
      unavailabilityReasonId, orientated, critical, oncall, charge, preceptor, meal } = this.scheduleForm.getRawValue();
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
      orientated: orientated || false,
      critical: critical || false,
      onCall: oncall || false,
      charge: charge || false,
      preceptor: preceptor || false,
      meal: meal || false,
    };

    if (this.selectedDaySchedule.scheduleType !== ScheduleType.Book) {
      schedule.initialStartTime = this.selectedDaySchedule.startDate;
      schedule.initialEndTime = this.selectedDaySchedule.endDate;
    }

    this.scheduleApiService.updateScheduledShift(schedule, this.selectedDaySchedule.scheduleType).pipe(
      catchError((error: HttpErrorResponse) => this.editScheduleService.handleError(error)),
      takeUntil(this.componentDestroy())
    ).subscribe(() => {
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

  private removeNewTab(): void {
    this.shiftTabs = GetScheduleTabItems(this.scheduledItem.schedule.daySchedules);
    this.isCreateMode = false;
  }

  private createFormForNewTab(): void {
    this.scheduleTypesControl.setValue(this.scheduleItemType);
    this.changeScheduleType(this.scheduleItemType);
  }

  private selectScheduledItem(schedule: ScheduleItem, scheduleIndex = 0): void {
    const patchData = {} as EditSchedule.ScheduledShiftForm;

    if (!this.hasInitData) {
      return;
    }

    this.selectedDaySchedule = schedule;
    this.selectedDayScheduleIndex = scheduleIndex;
    this.setEditPermissions();

    if (this.selectedDaySchedule.scheduleType === ScheduleType.Book) {
      this.scheduleFormConfig = ScheduledShiftFormConfig(this.hasEditPermissions);
      this.scheduleForm = this.editScheduleService.createScheduledShiftForm();
      patchData.regionId = this.selectedDaySchedule.orderMetadata?.regionId;
      patchData.orientated = this.selectedDaySchedule.attributes.orientated;
      patchData.critical = this.selectedDaySchedule.attributes.critical;
      patchData.oncall = this.selectedDaySchedule.attributes.onCall;
      patchData.charge = this.selectedDaySchedule.attributes.charge;
      patchData.preceptor = this.selectedDaySchedule.attributes.preceptor;
      patchData.meal = this.selectedDaySchedule.attributes.meal;
      this.watchForRegionControls();
      this.watchForToggleControls();
    }

    if (this.selectedDaySchedule.scheduleType === ScheduleType.Unavailability) {
      this.scheduleFormConfig = ScheduledUnavailabilityFormConfig(this.isCreateMode, this.hasEditPermissions);
      this.scheduleForm = this.editScheduleService.createScheduledUnavailabilityForm();
      patchData.unavailabilityReasonId = this.selectedDaySchedule.unavailabilityReasonId;
    }

    if (this.selectedDaySchedule.scheduleType === ScheduleType.Availability) {
      this.scheduleFormConfig = ScheduledAvailabilityFormConfig(this.isCreateMode, this.hasEditPermissions);
      this.scheduleForm = this.editScheduleService.createScheduledAvailabilityForm();
    }

    this.watchForShiftControl();
    this.watchForDateControl();
    patchData.date = DateTimeHelper.convertDateToUtc(this.scheduledItem.schedule.date);
    patchData.shiftId = this.selectedDaySchedule.shiftId || this.customShiftId;

    if (!this.selectedDaySchedule.shiftId) {
      this.setTimeForCustomShift();
    }

    this.isShiftOriented = !!patchData.orientated;
    this.scheduleForm.patchValue(patchData);
    this.cdr.markForCheck();
  }

  private createAvailability(): void {
    const { shiftId, startTime, endTime, date } = this.scheduleForm.getRawValue();
    const schedule: Schedule = {
      employeeScheduledDays: [{
        employeeId: this.scheduledItem.candidate.id,
        dates: [DateTimeHelper.toUtcFormat(new Date(date.setHours(0, 0, 0)))],
      }],
      scheduleType: this.scheduleTypesControl.value,
      startTime: getTime(startTime),
      endTime: getTime(endTime),
      unavailabilityReasonId: null,
      shiftId: shiftId !== this.customShiftId ? shiftId : null,
      createOrder: false,
    };

    this.scheduleApiService.createSchedule(schedule)
      .pipe(
        catchError((error: HttpErrorResponse) => this.createScheduleService.handleError(error)),
        takeUntil(this.componentDestroy())
      )
      .subscribe(() => this.handleSuccessAdding());
  }

  private checkBookingsOverlaps(): void {
    const { departmentId, skillId } = this.getFilterDepartmentSkillIds();
    const { shiftId, startTime, endTime, date, orientated, critical, oncall, charge, preceptor, meal }
      = this.scheduleForm.getRawValue();
    this.scheduleToBook = {
      employeeBookedDays: [{
        employeeId: this.scheduledItem.candidate.id,
        bookedDays: [DateTimeHelper.toUtcFormat(new Date(date.setHours(0, 0, 0)))],
      }],
      departmentId: departmentId as number,
      skillId: skillId,
      shiftId: shiftId !== this.customShiftId ? shiftId : null,
      startTime: getTime(startTime),
      endTime: getTime(endTime),
      createOrder: false,
      orientated: orientated || false,
      critical: critical || false,
      onCall: oncall || false,
      charge: charge || false,
      preceptor: preceptor || false,
      meal: meal || false,
    };
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
          return this.createBookSchedule();
        } else {
          this.openReplacementOrderDialog(response);

          return EMPTY;
        }
      }),
      takeUntil(this.componentDestroy())
    ).subscribe(() => this.handleSuccessAdding());
  }

  private checkUnavailabilityOverlaps(): void {
    const { shiftId, startTime, endTime, date, unavailabilityReasonId = null } = this.scheduleForm.getRawValue();
    this.unavailabilityToSave = {
      employeeScheduledDays: [{
        employeeId: this.scheduledItem.candidate.id,
        dates: [DateTimeHelper.toUtcFormat(new Date(date.setHours(0, 0, 0)))],
      }],
      scheduleType: this.scheduleTypesControl.value,
      startTime: getTime(startTime),
      endTime: getTime(endTime),
      unavailabilityReasonId,
      shiftId: shiftId !== this.customShiftId ? shiftId : null,
      createOrder: false,
    };
    const request: BookingsOverlapsRequest = {
      employeeScheduledDays: [{
        employeeId: this.scheduledItem.candidate.id,
        bookedDays: [DateTimeHelper.toUtcFormat(new Date(date.setHours(0, 0, 0)))],
      }],
      shiftId: this.unavailabilityToSave.shiftId,
      startTime: this.unavailabilityToSave.startTime,
      endTime: this.unavailabilityToSave.endTime,
    };

    this.scheduleApiService.checkBookingsOverlaps(request).pipe(
      catchError((error: HttpErrorResponse) => this.createScheduleService.handleError(error)),
      switchMap((response: BookingsOverlapsResponse[]) => {
        if (!response.length && this.unavailabilityToSave) {
          return this.createUnavailability();
        } else {
          this.openReplacementOrderDialog(response);

          return EMPTY;
        }
      }),
      takeUntil(this.componentDestroy())
    ).subscribe(() => this.handleSuccessAdding());
  }

  private openReplacementOrderDialog(replacementOrderDialogData: BookingsOverlapsResponse[]): void {
    this.replacementOrderDialogData = replacementOrderDialogData;
    this.replacementOrderDialogOpen = true;
    this.cdr.markForCheck();
  }

  private changeScheduledShift(scheduledItem: ScheduledItem | null) {
    if (scheduledItem && scheduledItem.schedule) {
      this.isCreateMode = false;
      this.scheduledItem = scheduledItem;
      this.shiftTabs = GetScheduleTabItems(scheduledItem.schedule.daySchedules);
      this.selectScheduledItem(this.scheduledItem.schedule.daySchedules[0]);
    }
  }

  private handleSuccessAdding(): void {
    this.updateScheduleGrid.emit();
    this.scheduleToBook = null;
    this.unavailabilityToSave = null;
    this.store.dispatch(new ShowToast(MessageTypes.Success, RECORDS_ADDED));
  }

  private createBookSchedule(): Observable<ScheduleBookingErrors[]> {
    return this.scheduleApiService.createBookSchedule(this.scheduleToBook as ScheduleBook).pipe(
      catchError((error: HttpErrorResponse) => this.createScheduleService.handleError(error)),
    );
  }

  private createUnavailability(): Observable<void> {
    if (!this.isCreateMode) {
      const { shiftId, startTime, endTime, date, unavailabilityReasonId } = this.scheduleForm.getRawValue();
      const schedule: EditSchedule.ScheduledShift = {
        scheduleId: this.selectedDaySchedule.id,
        unavailabilityReasonId,
        shiftId: shiftId === this.customShiftId ? null : shiftId,
        date: DateTimeHelper.setInitHours(DateTimeHelper.toUtcFormat(date)),
        startTime: getTime(startTime),
        endTime: getTime(endTime),
        createOrder: !!this.unavailabilityToSave?.createOrder,
        initialStartTime: this.selectedDaySchedule.startDate,
        initialEndTime: this.selectedDaySchedule.endDate,
      };

      return this.scheduleApiService.updateScheduledShift(schedule, this.selectedDaySchedule.scheduleType)
        .pipe(catchError((error: HttpErrorResponse) => this.createScheduleService.handleError(error)));
    }

    return this.scheduleApiService.createSchedule(this.unavailabilityToSave as Schedule)
      .pipe(catchError((error: HttpErrorResponse) => this.createScheduleService.handleError(error)));
  }

  private setScheduleTypes(): void {
    this.scheduleTypes = this.createScheduleService.getScheduleTypesWithPermissions(this.scheduleTypes, this.userPermission);
    this.scheduleItemType = this.createScheduleService.getFirstAllowedScheduleType(this.scheduleTypes);
  }

  private closeSideBar(): void {
    this.hasInitData = false;
    this.scheduleForm?.markAsUntouched();
    this.createScheduleService.closeSideBarEvent.next(true);
  }

  private updateScheduleFormConfig(isCustomShift: boolean): void {
    let selectedType: ScheduleItemType | ScheduleType;
    let type: typeof ScheduleItemType | typeof ScheduleType;

    if (this.isCreateMode) {
      type = ScheduleItemType;
      selectedType = this.scheduleItemType;
    } else {
      type = ScheduleType;
      selectedType = this.selectedDaySchedule.scheduleType;
    }

    this.showShiftTimeFields(isCustomShift);

    if (selectedType === type.Book && !this.isCreateMode) {
      this.scheduleFormConfig.formClass = isCustomShift
        ? 'scheduled-shift-form custom-scheduled-shift-form'
        : 'scheduled-shift-form';
    } else if (selectedType === type.Book && this.isCreateMode) {
      this.scheduleFormConfig.formClass = isCustomShift
        ? 'new-shift-form custom-new-shift-form'
        : 'new-shift-form';
    } else if (selectedType === type.Unavailability) {
      this.scheduleFormConfig.formClass = isCustomShift
        ? 'scheduled-unavailability-form custom-scheduled-unavailability-form'
        : 'scheduled-unavailability-form';
    } else if (selectedType === type.Availability) {
      this.scheduleFormConfig.formClass = isCustomShift
        ? 'scheduled-availability-form custom-scheduled-availability-form'
        : 'scheduled-availability-form';
    }

    this.cdr.markForCheck();
  }

  private showShiftTimeFields(show: boolean): void {
    this.scheduleFormConfig.formFields.forEach((item: EditScheduleFormFieldConfig) => {
      if (item.field === 'startTime' || item.field === 'endTime') {
        item.show = show;
      }
    });
  }

  private checkCandidateIsOrientedField(): void {
    const { date } = this.scheduleForm.getRawValue();
    const updatedCandidate = {
      ...this.scheduledItem.candidate,
      dates: [DateTimeHelper.toUtcFormat(date)],
    };
    const isCandidateOriented = this.createScheduleService.getCandidateOrientation(updatedCandidate);

    if (!isCandidateOriented) {
      this.scheduleForm.get('orientated')?.setValue(true);
      this.scheduleForm.get('orientated')?.disable();
    } else {
      this.scheduleForm.get('orientated')?.enable();
    }
  }

  @OutsideZone
  private scrollToNewScheduleTab() {
    setTimeout(() => this.tabs.nativeElement.scrollLeft = this.tabs.nativeElement.offsetLeft);
  }

  private getFilterDepartmentSkillIds(): { departmentId: number | null, skillId: number | null } {
    const scheduleFiltersData = this.scheduleFiltersService.getScheduleFiltersData();
    const departmentId = scheduleFiltersData.filters.departmentsIds?.length
      ? scheduleFiltersData.filters.departmentsIds[0]
      : null;
    const skillId = scheduleFiltersData.filters.skillIds?.length
      ? scheduleFiltersData.filters.skillIds[0]
      : null;

    return { departmentId, skillId };
  }

  private setEditPermissions(): void {
    this.canEmployeeEdit = !this.isEmployee || this.selectedDaySchedule.employeeCanEdit;
    this.showLockedMessage = this.selectedDaySchedule.scheduleType !== ScheduleType.Book && !this.canEmployeeEdit;
    this.hasEditPermissions = this.userPermission[EditSchedulePermissionsMap[this.selectedDaySchedule.scheduleType]]
      && this.canEmployeeEdit;
  }
}
