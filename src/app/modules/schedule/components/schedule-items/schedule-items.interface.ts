import { ScheduleType } from 'src/app/modules/schedule/enums';

export interface DateItem {
  date: Date;
  dateString: string;
  id: number | null;
  scheduleType?: ScheduleType;
  tooltipContent?: string;
}

export interface CreateScheduleItem {
  candidateName: string;
  candidateId: number;
  dateItems: DateItem[];
  selectedDates: Date[];
}
