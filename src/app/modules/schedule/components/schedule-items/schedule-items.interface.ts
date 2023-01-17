import { ScheduleType } from 'src/app/modules/schedule/enums';

export interface DateItem {
  date: Date;
  dateString: string;
  scheduleToOverrideId?: number;
  scheduleType?: ScheduleType;
  unavailabilityReason?: string
}

export interface CreateScheduleItem {
  candidateName: string;
  candidateId: number;
  dateItems: DateItem[];
  selectedDates: Date[];
}
