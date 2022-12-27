import { ItemModel } from '@syncfusion/ej2-splitbuttons/src/common/common-model';

import { DatesRangeType } from '@shared/enums';
import { DatePeriodId, ScheduleCandidateType, ScheduleType } from '../enums';
import { ScheduleCardConfig, ScheduleItem } from '../interface/schedule.model';

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

export const CandidateIconNameMap: Map<ScheduleCandidateType, string> = new Map<ScheduleCandidateType, string>()
  .set(ScheduleCandidateType.Default, '')
  .set(ScheduleCandidateType.Urgent, 'flag')
  .set(ScheduleCandidateType.NotFilled, 'compass');

export const ScheduleCardTypeMap: Map<ScheduleType, ScheduleCardConfig> = new Map<ScheduleType, ScheduleCardConfig>()
  .set(ScheduleType.Normal, {
    bgColor: '#C5D9FF',
    title: 'LOC-DEP',
    iconName: 'calendar',
    iconColor: '#3E7FFF',
    isLocDep: true,
  })
  .set(ScheduleType.Unavailable, { bgColor: '#EAECF2', title: 'PTO', iconName: 'alert-triangle', iconColor: '#FF5858' })
  .set(ScheduleType.Available, { bgColor: '#D1EACE', title: 'Available', iconName: 'clock', iconColor: '#70B16E' });

export const GetScheduleCardConfig = (scheduleItem: ScheduleItem): ScheduleCardConfig | undefined => {
  const scheduleCardConfig = ScheduleCardTypeMap.get(scheduleItem.type);

  if (scheduleCardConfig && scheduleItem.location && scheduleItem.department) {
    scheduleCardConfig.title = `${scheduleItem.location.slice(0, 3)}-${scheduleItem.department.slice(0, 3)}`;
  }

  return scheduleCardConfig;
};
