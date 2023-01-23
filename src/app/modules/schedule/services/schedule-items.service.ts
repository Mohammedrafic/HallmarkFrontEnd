import { Injectable } from '@angular/core';

import { DateTimeHelper } from '@core/helpers';
import { CreateScheduleItem, DateItem } from '../components/schedule-items/schedule-items.interface';
import * as ScheduleInt from '../interface';
import { CreateScheduleService } from './create-schedule.service';

@Injectable()
export class ScheduleItemsService {

  constructor(private createScheduleService: CreateScheduleService) {}

  getScheduleItems(scheduleSelectedSlots: ScheduleInt.ScheduleSelectedSlots): CreateScheduleItem[] {
    return scheduleSelectedSlots.candidates.map((candidate: ScheduleInt.ScheduleCandidate) => {
      return  {
        candidateName: `${candidate.lastName}, ${candidate.firstName}`,
        candidateId: candidate.id,
        selectedDates: scheduleSelectedSlots.dates.map((date: string) => new Date(date)),
        dateItems: this.getScheduleDateItems(scheduleSelectedSlots.dates, candidate.id),
      };
    });
  }

  getScheduleDateItems(dates: string[], candidateId: number): DateItem[] {
    const scheduleDateItems: DateItem[] = [];

    dates.forEach((dateString: string) => {
      const daySchedules: ScheduleInt.ScheduleItem[] = this.createScheduleService.getDaySchedules(candidateId, dateString);

      if (daySchedules.length) {
        daySchedules.forEach((scheduleItem: ScheduleInt.ScheduleItem) => {
          scheduleDateItems.push(this.getScheduleDateItem(scheduleItem, dateString));
        });
      } else {
        const date = new Date(dateString);

        scheduleDateItems.push({
          dateString: DateTimeHelper.setInitHours(DateTimeHelper.toUtcFormat(date)),
          id: null,
          date,
        });
      }
    });

    return scheduleDateItems;
  }

  getSelectedDates(scheduleItem: CreateScheduleItem): Date[] {
    const dates = scheduleItem.dateItems.map((item: DateItem) => item.dateString);
    const uniqueDates = [...new Set(dates)];

    return uniqueDates.map((date: string) => new Date(date));
  }

  private getScheduleDateItem(daySchedule: ScheduleInt.ScheduleItem, dateString: string): DateItem {
    const date = new Date(dateString);

    return {
      dateString: DateTimeHelper.setInitHours(DateTimeHelper.toUtcFormat(date)),
      tooltipContent: this.getTooltipContent(daySchedule),
      scheduleType: daySchedule.scheduleType,
      id: daySchedule.id,
      date,
    };
  }

  private getTooltipContent(daySchedule: ScheduleInt.ScheduleItem): string {
    const timeRange = this.getTimeRange(daySchedule.startDate, daySchedule.endDate);

    if (timeRange && daySchedule.unavailabilityReason) {
      return `${timeRange} ${daySchedule.unavailabilityReason}`;
    }

    if (timeRange) {
      return `${timeRange}`;
    }

    return '';
  }

  private getTimeRange(startDate: string, endDate: string): string {
    if (startDate && endDate) {
      return `${DateTimeHelper.formatDateUTC(startDate, 'HH:mm')} - ${DateTimeHelper.formatDateUTC(endDate, 'HH:mm')}`;
    }

    return '';
  }
}
