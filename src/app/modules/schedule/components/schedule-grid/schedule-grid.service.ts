import { Injectable } from '@angular/core';

import { ScheduleDateItem, ScheduleDateSlot, ScheduleModel, ScheduleModelPage } from '../../interface';

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

  public getFirstSelectedDate(selectedCandidatesSlot: Map<number, ScheduleDateSlot>): string {
    return `${this.getSelectedListDates(selectedCandidatesSlot)[0]}T00:00:00+00:00`;
  }

  private getSelectedListDates(selectedCandidatesSlot: Map<number, ScheduleDateSlot>): string[] {
    return [...selectedCandidatesSlot].flatMap((slot: [number, ScheduleDateSlot]) => {
      return [...slot[1].dates];
    });
  }
}
