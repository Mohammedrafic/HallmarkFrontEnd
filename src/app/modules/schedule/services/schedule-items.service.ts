import { Injectable } from '@angular/core';

import { DateTimeHelper } from '@core/helpers';
import { CreateScheduleService } from 'src/app/modules/schedule/services/create-schedule.service';
import { CreateScheduleItem, DateItem } from '../components/schedule-items/schedule-items.interface';
import {
  ScheduleCandidate,
  ScheduleDateItem,
  ScheduleItem,
  ScheduleModel,
  ScheduleSelectedSlots,
} from '../interface/schedule.model';

@Injectable()
export class ScheduleItemsService {

  constructor(private createScheduleService: CreateScheduleService) {}

  getScheduleItems(scheduleSelectedSlots: ScheduleSelectedSlots): CreateScheduleItem[] {
    return scheduleSelectedSlots.candidates.map((candidate: ScheduleCandidate) => {
      const scheduleItem: CreateScheduleItem = {
        candidateName: `${candidate.lastName}, ${candidate.firstName}`,
        candidateId: candidate.id,
        selectedDates: [],
        dateItems: scheduleSelectedSlots.dates.map((dateString: string) => {
          const daySchedule: ScheduleItem = this.getDayScheduleData(candidate.id, dateString);
          const date = new Date(dateString);

          return {
            dateString: DateTimeHelper.setInitHours(DateTimeHelper.toUtcFormat(date)),
            unavailabilityReason: daySchedule.unavailabilityReason,
            scheduleType: daySchedule.scheduleType,
            scheduleToOverrideId: daySchedule.id,
            date,
          };
        }),
      };

      scheduleItem.selectedDates = scheduleItem.dateItems.map((item: DateItem) => item.date);

      return scheduleItem;
    });
  }

  private getDayScheduleData(candidateId: number, dateString: string): ScheduleItem {
    const candidateData: ScheduleModel = this.createScheduleService.scheduleData
      .find((data: ScheduleModel) => data.candidate.id === candidateId) as ScheduleModel;
    const dateStringLength = 10;
    let daySchedule: ScheduleItem = {} as ScheduleItem;


    if (candidateData.schedule.length) {
      const dateSchedule: ScheduleDateItem | undefined = candidateData.schedule
        .find((scheduleItem: ScheduleDateItem) => scheduleItem.date.substring(0, dateStringLength) === dateString);

      if (dateSchedule) {
        daySchedule = dateSchedule.daySchedules
          .find((schedule: ScheduleItem) => schedule.date.substring(0, dateStringLength) === dateString)
          || {} as ScheduleItem;
      }
    }

    return daySchedule;
  }
}
