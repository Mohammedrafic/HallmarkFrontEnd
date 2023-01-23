import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import { Store } from '@ngxs/store';
import { EMPTY, Observable } from 'rxjs';

import { getTimeFromDate, setTimeToDate } from '@shared/utils/date-time.utils';
import { DateTimeHelper } from '@core/helpers';
import { CustomFormGroup, DropdownOption } from '@core/interface';
import { ShowToast } from 'src/app/store/app.actions';
import { MessageTypes } from '@shared/enums/message-types';
import { getAllErrors } from '@shared/utils/error.utils';
import { CreateScheduleItem } from '../components/schedule-items/schedule-items.interface';
import * as ScheduleInt from '../interface';

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

  handleError(error: HttpErrorResponse): Observable<never> {
    this.store.dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)));

    return EMPTY;
  }

  getEmployeeScheduledDays(
    scheduleItems: CreateScheduleItem[],
    startTime: Date,
    endTime: Date
  ): ScheduleInt.EmployeeScheduledDay[] {
    return scheduleItems.map((item: CreateScheduleItem) => {
      const scheduledDays: ScheduleInt.ScheduledDay[] = item.selectedDates.map((date: Date) => {
        const dateString: string =  DateTimeHelper.setInitHours(DateTimeHelper.toUtcFormat(date));

        return {
          scheduleToOverrideId: this.getScheduleToOverrideId(item.candidateId, dateString, startTime, endTime),
          date: dateString,
        };
      });

      return {
        employeeId: item.candidateId,
        scheduledDays,
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

  mapToDropdownOptions(items: { name: string; id: number }[]): DropdownOption[] {
    return items.map(item => {
      return {
        text: item.name,
        value: item.id,
      };
    });
  }

  private getScheduleToOverrideId(candidateId: number, dateString: string, startTime: Date, endTime: Date): number | null {
    const overlappingSchedule: ScheduleInt.ScheduleItem =
      this.getDaySchedules(candidateId, dateString).find((daySchedule: ScheduleInt.ScheduleItem) => {
        return this.isTimeRangeOverlapping(daySchedule, startTime, endTime);
      }) as ScheduleInt.ScheduleItem;

    return overlappingSchedule ? overlappingSchedule.id : null;
  }

  private isTimeRangeOverlapping(daySchedule: ScheduleInt.ScheduleItem, startTime: Date, endTime: Date): boolean {
    const dayScheduleStartTimeMs = setTimeToDate(getTimeFromDate(new Date(daySchedule.startDate), true))!.getTime();
    const dayScheduleEndTimeMs = setTimeToDate(getTimeFromDate(new Date(daySchedule.endDate), true))!.getTime();
    const shiftStartTimeMs = startTime.getTime();
    const shiftEndTimeMs = endTime.getTime();

    return (shiftStartTimeMs >= dayScheduleStartTimeMs && shiftEndTimeMs <= dayScheduleEndTimeMs)
      || (shiftEndTimeMs >= dayScheduleStartTimeMs && shiftStartTimeMs < dayScheduleStartTimeMs)
      || (shiftStartTimeMs <= dayScheduleEndTimeMs && shiftEndTimeMs > dayScheduleEndTimeMs);
  }
}
