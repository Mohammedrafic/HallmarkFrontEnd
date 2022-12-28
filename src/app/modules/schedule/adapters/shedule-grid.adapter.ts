import {
  CandidateSchedules,
  ScheduleCandidate,
  ScheduleCandidatesPage,
  ScheduleModelPage,
} from '../interface/schedule.model';

export class ScheduleGridAdapter {
  static combineCandidateData(
    candidates: ScheduleCandidatesPage,
    candidateSchedules: CandidateSchedules[],
  ): ScheduleModelPage {
    return {
      ...candidates,
      items: candidates.items.map((candidate: ScheduleCandidate) => ({
        candidate,
        schedule: candidateSchedules.find(candidateSchedulesItem =>
          candidateSchedulesItem.employeeId === candidate.id
        )?.schedules || [],
        id: candidate.id,
      })),
    };
  }
}
