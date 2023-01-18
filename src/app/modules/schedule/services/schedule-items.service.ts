import { Injectable } from '@angular/core';

import { DateTimeHelper } from '@core/helpers';
import { CreateScheduleService } from 'src/app/modules/schedule/services/create-schedule.service';
import { CreateScheduleItem, DateItem } from '../components/schedule-items/schedule-items.interface';
import * as ScheduleInt from '../interface';

@Injectable()
export class ScheduleItemsService {

  constructor(private createScheduleService: CreateScheduleService) {}

  getScheduleItems(scheduleSelectedSlots: ScheduleInt.ScheduleSelectedSlots): CreateScheduleItem[] {
    return scheduleSelectedSlots.candidates.map((candidate: ScheduleInt.ScheduleCandidate) => {
      const scheduleItem: CreateScheduleItem = {
        candidateName: `${candidate.lastName}, ${candidate.firstName}`,
        candidateId: candidate.id,
        selectedDates: [],
        dateItems: scheduleSelectedSlots.dates.map((dateString: string) => {
          return this.getScheduleDateItem(candidate.id, dateString);
        }),
      };

      scheduleItem.selectedDates = scheduleItem.dateItems.map((item: DateItem) => item.date);

      return scheduleItem;
    });
  }

  getScheduleDateItem(candidateId: number, dateString: string): DateItem {
    const daySchedule: ScheduleInt.ScheduleItem = this.getDayScheduleData(candidateId, dateString);
    const date = new Date(dateString);

    return {
      dateString: DateTimeHelper.setInitHours(DateTimeHelper.toUtcFormat(date)),
      unavailabilityReason: daySchedule.unavailabilityReason,
      scheduleType: daySchedule.scheduleType,
      scheduleToOverrideId: daySchedule.id,
      date,
    };
  }

  private getDayScheduleData(candidateId: number, dateString: string): ScheduleInt.ScheduleItem {
    const candidateData: ScheduleInt.ScheduleModel = this.createScheduleService.scheduleData
      .find((data: ScheduleInt.ScheduleModel) => data.candidate.id === candidateId) as ScheduleInt.ScheduleModel;
    const dateStringLength = 10;
    const formattedDateSting = dateString.substring(0, dateStringLength);
    let daySchedule: ScheduleInt.ScheduleItem = {} as ScheduleInt.ScheduleItem;


    if (candidateData.schedule.length) {
      const dateSchedule: ScheduleInt.ScheduleDateItem | undefined = candidateData.schedule
        .find((scheduleItem: ScheduleInt.ScheduleDateItem) =>
          scheduleItem.date.substring(0, dateStringLength) === formattedDateSting
        );

      if (dateSchedule) {
        daySchedule = dateSchedule.daySchedules
          .find((schedule: ScheduleInt.ScheduleItem) => schedule.date.substring(0, dateStringLength) === formattedDateSting)
          || {} as ScheduleInt.ScheduleItem;
      }
    }

    return daySchedule;
  }
}
