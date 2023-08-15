import { Injectable } from '@angular/core';

import {
  ScheduleCandidate,
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

  public removeCandidateSlotDay(days: ScheduleDay[], date: string): ScheduleDay[] {
    return days?.filter((day: ScheduleDay) => {
      return day.shiftDate.split('T')[0] !== date;
    });
  }

  public createSelectedCandidateSlotsWithDays(
    candidate: ScheduleCandidate,
    date: string,
    schedule?: ScheduleDateItem,
  ): ScheduleDateSlot {
    let selectedCandidateSlots = {
      candidate,
      dates: new Set<string>().add(date),
    };

    if(schedule) {
      selectedCandidateSlots = {
        ...selectedCandidateSlots,
        candidate: {
          ...selectedCandidateSlots.candidate,
          days: this.createDaysForSelectedSlots(candidate.days, schedule.daySchedules),
        },
      };
    }

    return selectedCandidateSlots;
  }

  public createDaysForSelectedSlots (days: ScheduleDay[], scheduleDays: ScheduleItem[]): ScheduleDay[] {
    const createdDays = this.createDays(scheduleDays);

    if(days?.length) {
      return this.updateScheduleDays(days, createdDays);
    }

    return createdDays;
  }

  public getFirstSelectedDate(selectedCandidatesSlot: Map<number, ScheduleDateSlot>): string {
    return `${this.getSelectedListDates(selectedCandidatesSlot)[0]}T00:00:00+00:00`;
  }

  public clearDaysForSchedule(scheduleData: ScheduleModelPage): ScheduleModelPage {
    return {
    ...scheduleData,
      items: scheduleData?.items.map((item: ScheduleModel) => {
      return {
        ...item,
        candidate: {
          ...item.candidate,
          days: [],
        },
      };
    }),
    };
  }

  private updateScheduleDays(days: ScheduleDay[], createdDays: ScheduleDay[]): ScheduleDay[] {
    const daysIds = days.map((day: ScheduleDay) => day.id);
    const hasDuplicate = createdDays.some((createdDay: ScheduleDay) => daysIds.includes(createdDay.id));

    if(hasDuplicate) {
      const createdDaysIds = createdDays.map((day: ScheduleDay) => day.id);
      return days.filter((day: ScheduleDay) => !createdDaysIds.includes(day.id));
    }

    return [...days, ...createdDays];
  }

  private createDays(scheduleDays: ScheduleItem[]): ScheduleDay[] {
    return scheduleDays.map((scheduleDay: ScheduleItem) => {
      return {
        id: scheduleDay.id,
        scheduleType: scheduleDay.scheduleType,
        type: scheduleDay?.orderMetadata?.orderType ?? null,
        department: scheduleDay.orderMetadata?.department ?? null,
        location: scheduleDay.orderMetadata?.location ?? null,
        endTime: scheduleDay.endDate,
        shiftDate: scheduleDay.date,
        startTime: scheduleDay.startDate,
        employeeCanEdit: scheduleDay.employeeCanEdit,
      };
    });
  }

  private getSelectedListDates(selectedCandidatesSlot: Map<number, ScheduleDateSlot>): string[] {
    return [...selectedCandidatesSlot].flatMap((slot: [number, ScheduleDateSlot]) => {
      return [...slot[1].dates];
    });
  }
}
