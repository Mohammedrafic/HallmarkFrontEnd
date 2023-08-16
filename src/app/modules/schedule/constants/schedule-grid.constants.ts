import { ItemModel } from '@syncfusion/ej2-splitbuttons/src/common/common-model';

import { DatesRangeType, WeekDays } from '@shared/enums';
import { IrpOrderType } from '@shared/enums/order-type';
import { isCandidateOriented } from '../components/candidate-card/candidate-card.helper';
import { CardTitle, CardTitleforExport, CreateScheduleAttributes, HasMultipleFilters } from '../helpers';
import { DatePeriodId, EmployeeIcons, ScheduleType } from '../enums';
import { ScheduleCandidate, ScheduleDateItem, ScheduleEventConfig, ScheduleFilters, Schedules } from '../interface';

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

export const CandidateIconName = (
  scheduleCandidate: ScheduleCandidate,
  filters: ScheduleFilters,
  startDate: string
): EmployeeIcons | null => {
  const candidateOrientation = isCandidateOriented(startDate, scheduleCandidate.orientationDate);

  if (!HasMultipleFilters(filters) && !(scheduleCandidate.orientationDate && candidateOrientation)) {
    return EmployeeIcons.Compass;
  }

  if (scheduleCandidate.employeeNote) {
    return EmployeeIcons.Flag;
  }

  return null;
};

export const GetScheduleEventConfig = (scheduleItem: ScheduleDateItem, eventIndex: number): ScheduleEventConfig => {
  const event = scheduleItem.daySchedules[eventIndex];
  const config = { startDate: event.startDate, endDate: event.endDate } as ScheduleEventConfig;

  if (event.scheduleType === ScheduleType.Book) {
    config.title = CardTitle(event);
    config.additionalAttributes = event.attributes ? CreateScheduleAttributes(event.attributes) : '';
    config.color = event.floated ? '#518CFF' : '#060715';
    config.ltaOrder = event.orderMetadata?.orderType === IrpOrderType.LongTermAssignment;
  }

  if (event.scheduleType === ScheduleType.Unavailability) {
    config.title = event.unavailabilityReason;
    config.shortTitle = event.unavailabilityReason;
    config.color = '#FF5858' ;
  }

  if (event.scheduleType === ScheduleType.Availability) {
    config.title = 'AVAIL';
    config.shortTitle = 'AV';
    config.color = '#5AA658' ;
  }

  return config;
};

export const GetScheduleEventConfigforExport = (scheduleItem: Schedules, eventIndex: number): ScheduleEventConfig => {
  const event = scheduleItem.daySchedules[eventIndex];
  const config = { startDate: event.startDate, endDate: event.endDate } as unknown as ScheduleEventConfig;

  if (event.scheduleType === ScheduleType.Book) {
    config.title = CardTitleforExport(event);
    config.additionalAttributes = event.attributes ? CreateScheduleAttributes(event.attributes) : '';
    config.color = '#060715';
    config.ltaOrder = event.orderMetadata?.orderType === IrpOrderType.LongTermAssignment;
  }

  if (event.scheduleType === ScheduleType.Unavailability) {
    config.title = 'UNAVAIL';
    config.shortTitle = 'UNAV';
    config.color = '#FF5858' ;
  }

  if (event.scheduleType === ScheduleType.Availability) {
    config.title = 'AVAIL';
    config.shortTitle = 'AV';
    config.color = '#5AA658' ;
  }

  return config;
};


export const WeekList = [WeekDays.Sun, WeekDays.Mon, WeekDays.Tue, WeekDays.Wed, WeekDays.Thu, WeekDays.Fri, WeekDays.Sat];
