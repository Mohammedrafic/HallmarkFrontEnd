import { ItemModel } from '@syncfusion/ej2-splitbuttons/src/common/common-model';

import { DatesRangeType, WeekDays } from '@shared/enums';

import { DatePeriodId, ScheduleType } from '../enums';
import { ScheduleCandidate, ScheduleCardConfig, ScheduleDateItem } from '../interface';

export const DatesPeriods: ItemModel[] = [
  {
    text: DatePeriodId.Day,
    id: DatesRangeType.Day,
  },
  {
    text: DatePeriodId.Week,
    id: DatesRangeType.OneWeek,
  },
  {
    text: DatePeriodId.TwoWeeks,
    id: DatesRangeType.TwoWeeks,
  },
];

export const MonthPeriod: ItemModel[] = [
  {
    text: DatePeriodId.Month,
    id: DatesRangeType.Month,
  },
];

export const CandidateIconName = (scheduleCandidate: ScheduleCandidate): string => {
  if (!scheduleCandidate.isOriented) {
    return 'compass';
  }

  if (scheduleCandidate.employeeNote) {
    return 'flag';
  }

  return '';
};

export const ScheduleCardTypeMap: Map<ScheduleType, ScheduleCardConfig> = new Map<ScheduleType, ScheduleCardConfig>()
  .set(ScheduleType.Book, {
    bgColor: '#C5D9FF',
    title: '',
    iconName: 'calendar',
    iconColor: '#3E7FFF',
    showTitleToolTip: true,
  })
  .set(ScheduleType.Unavailability, { bgColor: '#EAECF2', title: '', iconName: 'alert-triangle', iconColor: '#FF5858' })
  .set(ScheduleType.Availability, { bgColor: '#D1EACE', title: 'Available', iconName: 'clock', iconColor: '#70B16E' });

export const GetScheduleCardConfig = (scheduleItem: ScheduleDateItem): ScheduleCardConfig | undefined => {
  return ScheduleCardTypeMap.get(scheduleItem.daySchedules[0]?.scheduleType);
};

export const WeekList = [WeekDays.Sun, WeekDays.Mon, WeekDays.Tue, WeekDays.Wed, WeekDays.Thu, WeekDays.Fri, WeekDays.Sat];
