import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Store } from '@ngxs/store';
import { EMPTY, Observable, of, Subject } from 'rxjs';

import { DateWeekService } from '@core/services';
import { getTime } from '@shared/utils/date-time.utils';
import { DateTimeHelper } from '@core/helpers';
import { CustomFormGroup, DropdownOption, Permission } from '@core/interface';
import { ScheduleItemType } from 'src/app/modules/schedule/constants';
import { ShowToast } from 'src/app/store/app.actions';
import { MessageTypes } from '@shared/enums/message-types';
import { getAllErrors } from '@shared/utils/error.utils';
import { UserState } from 'src/app/store/user.state';
import { CreateScheduleItem } from '../components/schedule-items/schedule-items.interface';
import * as ScheduleInt from '../interface';
import {
  CreateScheduleTypesConfig,
  EmployeeBookingDay,
  OpenPositionParams,
  ScheduleBookingErrors,
  ScheduleCandidate,
  ScheduleDay,
  ScheduleForm,
  ScheduleFormConfig,
  ScheduleFormFieldConfig,
  ScheduleSelectedSlots,
  ScheduleTypeRadioButton,
} from '../interface';
import { ScheduleFiltersService } from './schedule-filters.service';
import { ScheduleClassesList, ScheduleCustomClassesList, ToggleControls } from '../components/create-schedule';
import { ScheduleShift } from '@shared/models/schedule-shift.model';
import { ScheduleType } from '../enums';
import { BookingsOverlapsResponse } from '../components/replacement-order-dialog/replacement-order.interface';
import { ConfirmService } from '@shared/services/confirm.service';
import {
  addAvailabilityToStart,
  ORIENTED_SHIFT_CHANGE_CONFIRM_TEXT,
  REQUIRED_PERMISSIONS,
  WARNING_TITLE,
} from '@shared/constants/messages';

@Injectable()
export class CreateScheduleService {
  public closeSideBarEvent: Subject<boolean> = new Subject<boolean>();

  private scheduleModels: ScheduleInt.ScheduleModel[] = [];

  set scheduleData(data: ScheduleInt.ScheduleModel[]) {
    this.scheduleModels = [...data];
  }

  get scheduleData(): ScheduleInt.ScheduleModel[] {
    return [...this.scheduleModels];
  }

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private scheduleFiltersService:  ScheduleFiltersService,
    private weekService: DateWeekService,
    private readonly confirmService: ConfirmService,
  ) {}

  createOpenPositionsForm(): CustomFormGroup<ScheduleInt.ScheduleForm> {
    return this.fb.group({
      shiftId: [null, Validators.required],
      startTime: [null, Validators.required],
      endTime: [null, Validators.required],
      hours: [null],
    }) as CustomFormGroup<ScheduleInt.ScheduleForm>;
  }

  createUnavailabilityForm(): CustomFormGroup<ScheduleInt.ScheduleForm> {
    return this.fb.group({
      unavailabilityReasonId: [null, Validators.required],
      shiftId: [null, Validators.required],
      startTime: [null, Validators.required],
      endTime: [null, Validators.required],
      hours: [null],
    }) as CustomFormGroup<ScheduleInt.ScheduleForm>;
  }

  createAvailabilityForm(): CustomFormGroup<ScheduleInt.ScheduleForm> {
    return this.fb.group({
      shiftId: [null, Validators.required],
      startTime: [null, Validators.required],
      endTime: [null, Validators.required],
      hours: [null],
    }) as CustomFormGroup<ScheduleInt.ScheduleForm>;
  }

  createBookForm(): CustomFormGroup<ScheduleInt.ScheduleForm> {
    return this.fb.group({
      shiftId: [null, Validators.required],
      startTime: [null, Validators.required],
      endTime: [null, Validators.required],
      hours: [null],
      orientated: [false],
      critical: [false],
      onCall: [false],
      charge: [false],
      preceptor: [false],
      meal: [true],
    }) as CustomFormGroup<ScheduleInt.ScheduleForm>;
  }

  handleError(error: HttpErrorResponse): Observable<never> {
    this.store.dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error) || error.error.detail));

    return EMPTY;
  }

  handleErrorMessage(error: HttpErrorResponse): Observable<ScheduleBookingErrors[]>{
    const parsedBookErrors: ScheduleBookingErrors[] | null = this.getParsedBookErrors(error);

    if (parsedBookErrors) {
      return of(parsedBookErrors);
    }

    this.store.dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)));
    return EMPTY;
  }

  createAvailabilityUnavailability(
    scheduleForm: FormGroup,
    scheduleItems: CreateScheduleItem[],
    scheduleType: number,
    customShiftId: number
  ): ScheduleInt.Schedule {
    const { shiftId, startTime, endTime, unavailabilityReasonId = null } = scheduleForm.getRawValue();
    return  {
      employeeScheduledDays: this.getEmployeeScheduledDays(scheduleItems),
      scheduleType,
      startTime: getTime(startTime),
      endTime: getTime(endTime),
      unavailabilityReasonId,
      shiftId: shiftId !== customShiftId ? shiftId : null,
      createOrder: false,
    };
  }

  createBooking(
    scheduleForm: FormGroup,
    scheduleItems: CreateScheduleItem[],
    customShiftId: number,
    skillIds: number[],
    departmentIds: number[],
  ): ScheduleInt.ScheduleBook {
    const {
      shiftId,
      startTime,
      endTime,
      orientated,
      critical,
      onCall,
      charge ,
      preceptor,
      meal,
    } = scheduleForm.getRawValue();

    return  {
      employeeBookedDays: this.getEmployeeBookedDays(scheduleItems),
      departmentId: departmentIds[0],
      skillId: skillIds[0],
      shiftId: shiftId !== customShiftId ? shiftId : null,
      startTime: getTime(startTime),
      endTime: getTime(endTime),
      createOrder: false,
      orientated: orientated || false,
      critical: critical || false,
      onCall: onCall || false,
      charge: charge || false,
      preceptor: preceptor || false,
      meal: meal || false,
    };
  }

  getEmployeeScheduledDays(scheduleItems: CreateScheduleItem[]): ScheduleInt.EmployeeScheduledDay[] {
    return scheduleItems.map((item: CreateScheduleItem) => {
      const dates: string[] = item.selectedDates
        .map((date: Date) => DateTimeHelper.setUtcTimeZone(DateTimeHelper.setInitDateHours(date)));

      return {
        employeeId: item.candidateId,
        dates,
      };
    });
  }

  getEmployeeBookedDays(scheduleItems: CreateScheduleItem[]): EmployeeBookingDay[] {
    return scheduleItems.map((item: CreateScheduleItem) => {
      const bookedDays = item.selectedDates.map((date: Date) => {
        const initDate = new Date(date.setHours(0, 0, 0));

        return DateTimeHelper.setUtcTimeZone(initDate);
      });

      return {
        employeeId: item.candidateId,
        bookedDays,
      };
    });
  }

  public hideToggleControls(config: ScheduleFormConfig, value: boolean): void {
    config.formFields
      .filter((configField: ScheduleFormFieldConfig) => {
        return ToggleControls.includes(configField.field);
      }).forEach((configField: ScheduleFormFieldConfig) => {
        configField.show = value;
    });
  }

  public confirmEditing(): Observable<boolean> {
    return this.confirmService.confirm(ORIENTED_SHIFT_CHANGE_CONFIRM_TEXT, {
      title: WARNING_TITLE,
      okButtonLabel: 'Ok',
      okButtonClass: 'ok-button',
    });
  }

  public setOrientationControlValue(
    selectedSlots: ScheduleSelectedSlots,
    form: CustomFormGroup<ScheduleForm>,
  ): void {
    const candidates = selectedSlots.candidates;
    const control = form?.get('orientated') as AbstractControl;

    if(candidates.length === 1 && form) {
      this.orientationForSingleCandidate(control,candidates);
    } else if(candidates.length > 1){
      this.orientationForMultiCandidates(control,candidates);
    }
  }

  public setOnCallControlValue(
    form: CustomFormGroup<ScheduleForm>,
    shiftId: number,
    shiftsList: ScheduleShift[]
  ): void {
    const onCallControl = form.get('onCall');

    if(onCallControl) {
      const selectedShift = shiftsList.find((shift: ScheduleShift) => shift.id === shiftId);

      onCallControl.patchValue(selectedShift ? selectedShift.onCall : false);
    }
  }

  getDaySchedules(candidateId: number, dateString: string): ScheduleInt.ScheduleItem[] {
    const dateStringLength = 10;
    const formattedDateSting = dateString.substring(0, dateStringLength);
    const candidateData: ScheduleInt.ScheduleModel = this.scheduleData
      .find((data: ScheduleInt.ScheduleModel) => data.candidate.id === candidateId) as ScheduleInt.ScheduleModel;

    if (candidateData.schedule.length) {
      const dateSchedule: ScheduleInt.ScheduleDateItem | undefined = candidateData.schedule
        .find((scheduleItem: ScheduleInt.ScheduleDateItem) =>
          scheduleItem.date.substring(0, dateStringLength) === formattedDateSting
        );

      if (dateSchedule) {
        return dateSchedule.daySchedules;
      }
    }

    return [];
  }

  // TODO: replace with helper function from schedule.helper.ts
  mapToDropdownOptions(items: { name: string; id: number }[]): DropdownOption[] {
    return items.map(item => {
      return {
        text: item.name,
        value: item.id,
      };
    });
  }

  getScheduleTypesWithPermissions(
    scheduleTypes:CreateScheduleTypesConfig,
    userPermission: Permission,
    scheduleWithAvailability: boolean,
    candidates: ScheduleCandidate[]
  ): CreateScheduleTypesConfig {
    let canScheduleWithoutAvailability = false;

    if(scheduleWithAvailability) {
      canScheduleWithoutAvailability = !this.hasDifferentTypeSchedule(candidates);
    }

    let types = scheduleTypes.source.map((item: ScheduleTypeRadioButton) => {
      return {
        ...item,
        toolTipMessage: !userPermission[item.permission] ? REQUIRED_PERMISSIONS : addAvailabilityToStart,
        disabled: !userPermission[item.permission] || (canScheduleWithoutAvailability &&
            (item.value === ScheduleItemType.Book || item.value === ScheduleItemType.OpenPositions)),
      };
    });

    if (this.store.selectSnapshot(UserState.user)?.isEmployee) {
      types = types.filter((type: ScheduleTypeRadioButton) => {
        return type.value !== ScheduleItemType.Book && type.value !== ScheduleItemType.OpenPositions;
      });
    }

    return {
      columnsTemplate: this.getScheduleTypeColumnsTemplate(types),
      source: types,
    };
  }

  getFirstAllowedScheduleType(scheduleTypes: CreateScheduleTypesConfig): ScheduleItemType {
    return (scheduleTypes.source.find((item: ScheduleTypeRadioButton) => !item.disabled) as ScheduleTypeRadioButton)?.value;
  }

  updateScheduleFormClass(scheduleType: ScheduleItemType, isCustom: boolean): string {
    let className = ScheduleClassesList[ScheduleItemType.Book];

    if (scheduleType === ScheduleItemType.Book) {
      className = isCustom ?
        ScheduleCustomClassesList[ScheduleItemType.Book] :
        ScheduleClassesList[ScheduleItemType.Book];
    }

    if (scheduleType === ScheduleItemType.Availability) {
      className = isCustom ?
        ScheduleCustomClassesList[ScheduleItemType.Availability] :
        ScheduleClassesList[ScheduleItemType.Availability];
    }

    if (scheduleType === ScheduleItemType.Unavailability) {
      className = isCustom ?
        ScheduleCustomClassesList[ScheduleItemType.Unavailability] :
        ScheduleClassesList[ScheduleItemType.Unavailability];
    }

    if(scheduleType === ScheduleItemType.OpenPositions) {
      className = isCustom ?
        ScheduleCustomClassesList[ScheduleItemType.OpenPositions] :
        ScheduleClassesList[ScheduleItemType.OpenPositions];
    }

    return className;
  }

  getCandidateOrientation(candidate: ScheduleCandidate): boolean {
    return candidate.dates.every((date: string) => {
      if(candidate.orientationDate) {
        return DateTimeHelper.setCurrentTimeZone(date) >= DateTimeHelper.setCurrentTimeZone(candidate.orientationDate);
      } else {
        return false;
      }
    });
  }

  hasBookingDate(candidates: ScheduleCandidate[]): boolean {
    return candidates.map((candidate: ScheduleCandidate) => {
        return candidate.days?.some((day: ScheduleDay) => {
          return day.scheduleType === ScheduleType.Book;
        });
      }).some((isBookingDate: boolean) => isBookingDate);
  }

  prepareCandidateReplacementDates(candidates: ScheduleCandidate[]): BookingsOverlapsResponse[] {
    return candidates.filter((candidate: ScheduleCandidate) => {
      return candidate.days?.length;
    }).map((candidate: ScheduleCandidate) => {
      return {
        bookings: this.getDaysWithBooking(candidate.days),
        employeeId: candidate.id,
        firstName: candidate.firstName,
        lastName: candidate.lastName,
      } as BookingsOverlapsResponse;
    });
  }

  resetScheduleControls(scheduleForm: FormGroup, controlsList: string[]): void {
    controlsList.forEach((control: string) => {
      scheduleForm.get(control)?.reset();
    });
  }

  getIdsRemovedDates(candidates: ScheduleCandidate[]): number[] {
    return candidates.filter((candidate: ScheduleCandidate) => candidate.days?.length)
      .map((candidate: ScheduleCandidate) => {
        return candidate.days.map((day: ScheduleDay) => {
          return day.id;
        });
      }).flat();
  }

  hasSelectedSlotsWithDate(candidates: ScheduleCandidate[]): boolean {
    return candidates.some((candidate: ScheduleCandidate) => {
      return candidate.days?.length;
    });
  }

  createOpenPositionsParams(dates: string[], eventDepartmentId?: number, eventSkillId?: number): OpenPositionParams {
    const scheduleFiltersData = this.scheduleFiltersService.getScheduleFiltersData();
    const departmentId = eventDepartmentId ?? (scheduleFiltersData.filters.departmentsIds as number[])[0];
    const skillId = eventSkillId ?? (scheduleFiltersData.filters.skillIds as number[])[0];

    if (dates.length) {
      return  { departmentId, skillId, selectedDates: dates };
    }

    const [startDate, endDate] = this.weekService.getRange();

    return { departmentId, skillId, startDate, endDate };
  }

  canEmployeeCreateRecord(isEmployee: boolean, dates: Date[] | string[], start: Date): boolean {
    if (!isEmployee) {
      return true;
    }

    const todayInMs: number = new Date().getTime();
    const selectedDatesInMs: number[] = dates
      .map((date: Date | string) => new Date(date).setHours(start.getHours(), start.getMinutes(), 0, 0));

    return !selectedDatesInMs.filter((date: number) => date < todayInMs).length;
  }

  private orientationForMultiCandidates(control: AbstractControl, candidates: ScheduleCandidate[]): void {
    const isCandidatesOriented = candidates.map((candidate: ScheduleCandidate) => {
      return this.getCandidateOrientation(candidate);
    }).every((orientation: boolean) => orientation);

    if(!isCandidatesOriented) {
      control?.patchValue(true);
      control?.disable();
    } else {
      control?.enable();
      control?.patchValue(false);
    }
  }

  private hasDifferentTypeSchedule(candidates: ScheduleCandidate[]): boolean {
    const candidateDays = candidates?.map((candidate: ScheduleCandidate) => candidate.days).flat();
    return candidateDays?.some((day: ScheduleDay) => {
      return day?.scheduleType === ScheduleType.Book || day?.scheduleType === ScheduleType.Availability;
    });
  }

  private getDaysWithBooking(days: ScheduleDay[]): ScheduleDay[] {
    return days.filter((day: ScheduleDay) => day.scheduleType === ScheduleType.Book);
  }

  private orientationForSingleCandidate(control: AbstractControl, candidates: ScheduleCandidate[]): void {
    const isCandidateOriented = this.getCandidateOrientation(candidates[0]);

    control?.patchValue(!isCandidateOriented);

    if(!isCandidateOriented) {
      control?.disable();
    } else {
      control?.enable();
    }
  }

  private getScheduleTypeColumnsTemplate(types: ScheduleTypeRadioButton[]): string {
    return types.length > 3 ? 'auto auto auto auto' : `repeat(${types.length},1fr)`;
  }

  private getParsedBookErrors(error: HttpErrorResponse): ScheduleBookingErrors[] | null {
    const bookErrors = error.error.errors.CreateBookingsCommand;
    let parsedErrors: ScheduleBookingErrors[] | null;

    if (!bookErrors) {
      return null;
    }

    try {
      parsedErrors = JSON.parse(bookErrors);
    } catch {
      parsedErrors = null;
    }

    return parsedErrors;
  }
}
