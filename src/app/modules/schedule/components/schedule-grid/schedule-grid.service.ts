import { Injectable } from '@angular/core';

import {
  ScheduleDateItem,
  ScheduleDateSlot,
  ScheduleDay,
  ScheduleItem,
  ScheduleModel,
  ScheduleModelPage,
} from '../../interface';

@Injectable()
export class ScheduleGridService {
  public getSlotsWithDate(scheduleData: ScheduleModelPage): string[] {
    return scheduleData.items
      .filter((item: ScheduleModel) => !!item.schedule.length)
      .map((item: ScheduleModel) => {
        return item.schedule.map((scheduleItem: ScheduleDateItem) => scheduleItem.date);
      }).flat();
  }

  public shouldShowEditSideBar(
    selectedSlots: Map<number, ScheduleDateSlot>,
    scheduleData: ScheduleModel[],
    candidateId: number,
  ): boolean {
    const selectedDateList = this.getSelectedListDates(selectedSlots);
    const selectedCandidate = scheduleData.find(((schedule: ScheduleModel) => {
      return schedule.candidate.id === candidateId;
    }));
    const slotsWithDate = selectedCandidate?.schedule.map((item: ScheduleDateItem) => item.date) as string[];


    return selectedSlots.size <= 1 &&
      selectedDateList.length <= 1 &&
      slotsWithDate.includes(`${selectedDateList[0]}T00:00:00+00:00`);
  }

  public createDaysForSelectedSlots (days: ScheduleDay[], scheduleDay: ScheduleItem[]): ScheduleDay[] {
    const createdDay = this.createDay(scheduleDay[0]);

    if(days?.length) {
      return this.updateScheduleDays(days, createdDay);
    }

    return [createdDay];
  }

  public getFirstSelectedDate(selectedCandidatesSlot: Map<number, ScheduleDateSlot>): string {
    return `${this.getSelectedListDates(selectedCandidatesSlot)[0]}T00:00:00+00:00`;
  }

  private updateScheduleDays(days: ScheduleDay[], createdDay: ScheduleDay): ScheduleDay[] {
    const selectedDayIndex = days.findIndex((day: ScheduleDay) => day.id === createdDay.id);

    if(selectedDayIndex === -1) {
      return [
        ...days,
        createdDay,
      ];
    } else {
      days.splice(selectedDayIndex, 1);
      return days;
    }
  }

  private createDay(scheduleDay: ScheduleItem): ScheduleDay {
    return {
      id: scheduleDay.id,
      scheduleType: scheduleDay.scheduleType,
      type: scheduleDay?.orderMetadata?.orderType ?? null,
      department: scheduleDay.orderMetadata?.department ?? null,
      location: scheduleDay.orderMetadata?.location ?? null,
      endTime: scheduleDay.endDate,
      shiftDate: scheduleDay.date,
      startTime: scheduleDay.startDate,
    };
  }

  private getSelectedListDates(selectedCandidatesSlot: Map<number, ScheduleDateSlot>): string[] {
    return [...selectedCandidatesSlot].flatMap((slot: [number, ScheduleDateSlot]) => {
      return [...slot[1].dates];
    });
  }
}
