import { GenerateUniqueId } from '@core/helpers/functions.helper';

import {
  CandidateSchedules,
  ScheduleCandidate,
  ScheduleCandidatesPage,
  ScheduleDateSlot,
  ScheduleModelPage,
  ScheduleSelectedSlots,
} from '../interface/schedule.interface';

export class ScheduleGridAdapter {
  static combineCandidateData(
    candidates: ScheduleCandidatesPage,
    candidateSchedules: CandidateSchedules[],
  ): ScheduleModelPage {
    return {
      ...candidates,
      items: candidates.items.map((candidate: ScheduleCandidate) => {
        const foundCandidateSchedule = candidateSchedules.find(candidateSchedulesItem =>
          candidateSchedulesItem.employeeId === candidate.id
        );

        return {
          candidate: {
            ...candidate,
            workHours: foundCandidateSchedule?.workHours || [],
          },
          schedule: foundCandidateSchedule?.schedules || [],
          id: GenerateUniqueId(),
        };
      }),
    };
  }

  static prepareSelectedCells(slots: Map<number, ScheduleDateSlot>): ScheduleSelectedSlots {
    const iteratedDates: string[] = [];

    const candidates = [...slots.values()].reduce((acc: ScheduleCandidate[], slot: ScheduleDateSlot) => {
      acc.push(slot.candidate);
      iteratedDates.push(...slot.dates.values());

      return acc;
    }, []);

    return {
      candidates,
      dates: [...new Set([...iteratedDates]).values()],
    };
  }
}
