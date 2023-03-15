import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Store } from '@ngxs/store';
import { EMPTY, Observable, of } from 'rxjs';

import { convertMsToTime, getTime, getTimeFromDate, setTimeToDate } from '@shared/utils/date-time.utils';
import { DateTimeHelper } from '@core/helpers';
import { CustomFormGroup, DropdownOption, Permission } from '@core/interface';
import { ScheduleItemType } from 'src/app/modules/schedule/constants';
import { ShowToast } from 'src/app/store/app.actions';
import { MessageTypes } from '@shared/enums/message-types';
import { getAllErrors } from '@shared/utils/error.utils';
import { CreateScheduleItem } from '../components/schedule-items/schedule-items.interface';
import * as ScheduleInt from '../interface';
import { ScheduleItemsComponent } from '../components/schedule-items/schedule-items.component';
import { EmployeeBookingDay, ScheduleBookingErrors, ScheduleTypeRadioButton } from '../interface';

@Injectable()
export class CreateScheduleService {

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
  ) {}

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
      regionId: [null],
      locationId: [null],
      departmentId: [null],
      skillId: [null],
    }) as CustomFormGroup<ScheduleInt.ScheduleForm>;
  }

  handleError(error: HttpErrorResponse): Observable<never> {
    this.store.dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error) || error.error.detail));

    return EMPTY;
  }

  handleErrorMessage(error: HttpErrorResponse): Observable<ScheduleBookingErrors[]>{
    const bookErrors = error.error.errors.CreateBookingsCommand;

    if(bookErrors) {
      return of(JSON.parse(bookErrors));
    } else {
      this.store.dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)));
      return EMPTY;
    }
  }

  createAvailabilityUnavailability(
    scheduleForm: FormGroup,
    scheduleItemsComponent: ScheduleItemsComponent,
    scheduleType: number,
    customShiftId: number
  ): ScheduleInt.Schedule {
    const { shiftId, startTime, endTime, unavailabilityReasonId = null } = scheduleForm.getRawValue();
    return  {
      employeeScheduledDays: this.getEmployeeScheduledDays(scheduleItemsComponent.scheduleItems, startTime, endTime),
      scheduleType,
      startTime: getTime(startTime),
      endTime: getTime(endTime),
      unavailabilityReasonId,
      shiftId: shiftId !== customShiftId ? shiftId : null,
    };
  }

  createBooking(
    scheduleForm: FormGroup,
    scheduleItemsComponent: ScheduleItemsComponent,
    customShiftId: number
  ): ScheduleInt.ScheduleBook {
    const { departmentId,skillId, shiftId, startTime, endTime } = scheduleForm.getRawValue();

    return  {
      employeeBookedDays: this.getEmployeeBookedDays(scheduleItemsComponent.scheduleItems),
      departmentId: departmentId,
      skillId: skillId,
      shiftId: shiftId !== customShiftId ? shiftId : null,
      startTime: getTime(startTime),
      endTime: getTime(endTime),
    };
  }

  getEmployeeScheduledDays(
    scheduleItems: CreateScheduleItem[],
    startTime: Date,
    endTime: Date
  ): ScheduleInt.EmployeeScheduledDay[] {
    return scheduleItems.map((item: CreateScheduleItem) => {
      const scheduledDays: ScheduleInt.ScheduledDay[] = item.selectedDates.map((date: Date) => {
        const dateValue: string =  DateTimeHelper.setInitHours(DateTimeHelper.toUtcFormat(date));

        return {
          schedulesToOverrideIds: this.getScheduleToOverrideIds(item.candidateId, dateValue, startTime, endTime),
          date: dateValue,
        };
      });

      return {
        employeeId: item.candidateId,
        scheduledDays,
      };
    });
  }

  getEmployeeBookedDays(scheduleItems: CreateScheduleItem[]): EmployeeBookingDay[] {
    return scheduleItems.map((item: CreateScheduleItem) => {
      const bookedDays = item.selectedDates.map((date: Date) =>
        DateTimeHelper.setInitHours(DateTimeHelper.toUtcFormat(date)));

      return {
        employeeId: item.candidateId,
        bookedDays,
      };
    });
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
    scheduleTypes:ReadonlyArray<ScheduleTypeRadioButton>,
    userPermission: Permission
  ): ReadonlyArray<ScheduleTypeRadioButton> {
    return scheduleTypes.map((item: ScheduleTypeRadioButton) => {
      return {
        ...item,
        disabled: !userPermission[item.permission],
      };
    });
  }

  getFirstAllowedScheduleType(scheduleTypes:ReadonlyArray<ScheduleTypeRadioButton>): ScheduleItemType {
    return (scheduleTypes.find((item: ScheduleTypeRadioButton) => !item.disabled) as ScheduleTypeRadioButton)?.value;
  }

  private getScheduleToOverrideIds(
    candidateId: number,
    dateString: string,
    startTime: Date,
    endTime: Date
  ): number[] | null {
    const overlappingScheduleIds: number[] = this.getDaySchedules(candidateId, dateString)
      .filter((daySchedule: ScheduleInt.ScheduleItem) => this.isTimeRangeOverlapping(daySchedule, startTime, endTime))
      .map((daySchedule: ScheduleInt.ScheduleItem) => daySchedule.id);

    return overlappingScheduleIds.length ? overlappingScheduleIds : null;
  }

  private isTimeRangeOverlapping(daySchedule: ScheduleInt.ScheduleItem, startTime: Date, endTime: Date): boolean {
    const dayScheduleStartTimeMs = setTimeToDate(getTimeFromDate(new Date(daySchedule.startDate), true))!.getTime();
    const dayScheduleEndTimeMs = setTimeToDate(getTimeFromDate(new Date(daySchedule.endDate), true))!.getTime();
    const shiftStartTimeMs = startTime.getTime();
    const shiftEndTimeMs = endTime.getTime();

    return (shiftStartTimeMs >= dayScheduleStartTimeMs && shiftEndTimeMs <= dayScheduleEndTimeMs)
      || (shiftEndTimeMs > dayScheduleStartTimeMs && shiftStartTimeMs < dayScheduleStartTimeMs)
      || (shiftStartTimeMs < dayScheduleEndTimeMs && shiftEndTimeMs > dayScheduleEndTimeMs);
  }
}
