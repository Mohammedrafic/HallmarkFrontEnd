import { ItemModel } from '@syncfusion/ej2-splitbuttons/src/common/common-model';

import { DatesRangeType } from '@shared/enums';

import { DatePeriodId, ScheduleType } from '../enums';
import { ScheduleCandidate, ScheduleCardConfig, ScheduleDateItem } from '../interface/schedule.model';

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
    title: 'LOC-DEP',
    iconName: 'calendar',
    iconColor: '#3E7FFF',
    showTitleToolTip: true,
    showAdditionalTooltip: true,
  })
  .set(ScheduleType.Unavailability, { bgColor: '#EAECF2', title: 'PTO', iconName: 'alert-triangle', iconColor: '#FF5858' })
  .set(ScheduleType.Availability, { bgColor: '#D1EACE', title: 'Available', iconName: 'clock', iconColor: '#70B16E' });

export const GetScheduleCardConfig = (scheduleItem: ScheduleDateItem): ScheduleCardConfig | undefined => {
  const firstDaySchedule = scheduleItem.daySchedules[0];
  const scheduleCardConfig = ScheduleCardTypeMap.get(firstDaySchedule?.scheduleType);

  if (scheduleCardConfig && firstDaySchedule?.scheduleType === ScheduleType.Book) {
    scheduleCardConfig.title = `${firstDaySchedule.location.slice(0, 3)}-${firstDaySchedule.department.slice(0, 3)}`;
    scheduleCardConfig.iconName = scheduleItem.isInDifferentDepartments ? 'briefcase' : 'calendar';
  }

  return scheduleCardConfig;
};
