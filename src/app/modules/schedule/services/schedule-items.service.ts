import { Injectable } from '@angular/core';

import { distinctUntilChanged, Observable, Subject } from 'rxjs';

import { BaseObservable, DateTimeHelper, isObjectsEqual } from '@core/helpers';
import { CreateScheduleItem, DateItem } from '../components/schedule-items/schedule-items.interface';
import * as ScheduleInt from '../interface';
import { CreateScheduleService } from './create-schedule.service';
import { CreateBookTooltip, CreateScheduleDateItems, CreateTooltip, GetScheduleDayWithEarliestTime } from '../helpers';
import { RemovedSlot, ScheduleBookingErrors, ScheduleCandidate } from '../interface';
import { ScheduleItemType } from '../constants';
import { IrpOrderType } from '@shared/enums/order-type';

@Injectable()
export class ScheduleItemsService {
  private readonly itemsErrorStore: BaseObservable<ScheduleBookingErrors[]> =
    new BaseObservable([] as ScheduleBookingErrors[]);
  public removeCandidateItem: Subject<RemovedSlot> = new Subject<RemovedSlot>();

  constructor(private createScheduleService: CreateScheduleService) {}

  getScheduleItems(
    scheduleSelectedSlots: ScheduleInt.ScheduleSelectedSlots,
    scheduleType: ScheduleItemType
  ): CreateScheduleItem[] {
    return scheduleSelectedSlots.candidates.map((candidate: ScheduleInt.ScheduleCandidate) => {

      return  {
        candidateName: `${candidate.lastName}, ${candidate.firstName}`,
        candidateId: candidate.id,
        selectedDates: candidate.dates.map((date: string) => new Date(`${date}T00:00:00`)),
        dateItems: this.getDateItems(candidate.dates, candidate.id, scheduleType, candidate.orderType),
      };
    });
  }

  getScheduleDateItems(dates: string[], candidateId: number): DateItem[] {
    const scheduleDateItems: DateItem[] = [];

    dates.forEach((dateValue: string) => {
      const daySchedules: ScheduleInt.ScheduleItem[] = this.createScheduleService.getDaySchedules(candidateId, dateValue);

      if (daySchedules.length) {
        daySchedules.forEach((scheduleItem: ScheduleInt.ScheduleItem) => {
          scheduleDateItems.push(this.getScheduleDateItem(scheduleItem, dateValue));
        });
      } else {
        scheduleDateItems.push(CreateScheduleDateItems(dateValue));
      }
    });

    return scheduleDateItems;
  }

  getBookScheduleDateItems(dates: string[], candidateId: number, orderType: IrpOrderType | null): DateItem[]  {
    const scheduleDateItems: DateItem[] = [];

    dates.forEach((dateValue: string) => {
      const daySchedules: ScheduleInt.ScheduleItem[] = this.createScheduleService.getDaySchedules(candidateId, dateValue);

      if (daySchedules.length) {
        const scheduleDayWithEarliestTime = GetScheduleDayWithEarliestTime(daySchedules);
        const date = new Date(`${dateValue}T00:00:00`);

        scheduleDateItems.push({
          dateValue: DateTimeHelper.toUtcFormat(date),
          tooltipContent: CreateBookTooltip(daySchedules) as string,
          scheduleType: scheduleDayWithEarliestTime.scheduleType,
          orderType,
          id: scheduleDayWithEarliestTime.id,
          date,
        });
      } else {
        scheduleDateItems.push(CreateScheduleDateItems(dateValue));
      }
    });

    return scheduleDateItems;
  }

  getSelectedDates(scheduleItem: CreateScheduleItem): Date[] {
    const dates = scheduleItem.dateItems.map((item: DateItem) => item.dateValue);
    const uniqueDates = [...new Set(dates)];

    return uniqueDates.map((date: string) => new Date(date));
  }

  setErrors(errors: ScheduleBookingErrors[]): void {
    if(errors) {
      this.itemsErrorStore.set(errors);
    }
  }

  getSelectedCandidate(candidates: ScheduleCandidate[], candidateId: number): ScheduleCandidate {
    return candidates.find((candidate: ScheduleCandidate) => {
      return candidate.id === candidateId;
    }) as ScheduleCandidate;
  }

  getErrorsStream(): Observable<ScheduleBookingErrors[]> {
    return this.itemsErrorStore.getStream()
      .pipe(
        distinctUntilChanged((previous: ScheduleBookingErrors[], current: ScheduleBookingErrors[]) => isObjectsEqual(
          previous[0] as unknown as Record<string, unknown>,
          current[0] as unknown as Record<string, unknown>
        )),
      );
  }

  private getScheduleDateItem(daySchedule: ScheduleInt.ScheduleItem, dateString: string): DateItem {
    const date = new Date(dateString);

    return {
      dateValue: DateTimeHelper.setInitHours(DateTimeHelper.toUtcFormat(date)),
      tooltipContent: CreateTooltip(daySchedule),
      scheduleType: daySchedule.scheduleType,
      id: daySchedule.id,
      date,
    };
  }

  private getDateItems(
    dates: string[],
    candidateId: number,
    scheduleType: ScheduleItemType,
    orderType: IrpOrderType | null
  ): DateItem[] {
    if(scheduleType === ScheduleItemType.Book) {
      return this.getBookScheduleDateItems(dates, candidateId, orderType);
    } else {
      return this.getScheduleDateItems(dates, candidateId);
    }
  }
}
