import { TabsListConfig } from '@shared/components/tabs-list/tabs-list-config.model';

import { ScheduleCandidate, ScheduleItem, ScheduleModel } from '../interface/schedule.model';
import { ScheduleCandidateType, ScheduleOrderType, ScheduleType, TabTitleConfig } from '../enums/schedule.enum';

export const TabListConfig: TabsListConfig[] = [
  {
    title: TabTitleConfig.Scheduling,
  },
  {
    title: TabTitleConfig.Analytics,
  },
];

export const MOK_SCHEDULE: ScheduleItem = {
  id: '123456',
  date: '2022-12-22T12:00',
  startDate: '2022-12-10T12:00',
  endDate: '2022-12-10T16:00',
  type: ScheduleType.Normal,
  orderType: ScheduleOrderType.LTA,
  location: 'Alabama',
  department: 'Potert',
  orderId: 123,
  isInDifferentDepartments: true,
};

export const MOK_SCHEDULE_1: ScheduleItem = {
  id: '1234567',
  date: '2022-12-24T12:00',
  startDate: '2022-12-13T12:00',
  endDate: '2022-12-13T16:00',
  type: ScheduleType.Available,
  orderType: ScheduleOrderType.NO,
  orderId: 123,
};

export const MOK_SCHEDULE_2: ScheduleItem = {
  id: '12345679',
  date: '2022-12-30T12:00',
  startDate: '2022-12-14T15:00',
  endDate: '2022-12-14T16:00',
  type: ScheduleType.Unavailable,
  orderType: ScheduleOrderType.LTA,
  orderId: 123,
};

export const MOK_CANDIDATE: ScheduleCandidate = {
  id: '123456790',
  firstName: 'Sanders',
  lastName: 'Paul',
  date: '2022-12-16T12:00',
  direction: 'Cardiologist',
  text: 'Work Commitment',
  type: ScheduleCandidateType.Default,
};

export const MOK_CANDIDATE_1: ScheduleCandidate = {
  id: '1234',
  firstName: 'Sanders',
  lastName: 'Pa',
  date: '2022-12-20T12:00',
  direction: 'Cardiologist',
  text: 'Work Commi',
  type: ScheduleCandidateType.Urgent,
};

export const MOK_CANDIDATE_2: ScheduleCandidate = {
  id: '12345',
  firstName: 'Sande',
  lastName: 'Paul',
  date: '2022-12-19T12:00',
  direction: 'Cardiologist',
  text: 'Work Commitment',
  type: ScheduleCandidateType.NotFilled,
};

export const MOK_DATA: ScheduleModel[] = [
  {
    candidate: MOK_CANDIDATE,
    schedule: [MOK_SCHEDULE, MOK_SCHEDULE_1, MOK_SCHEDULE_2],
    id: 1,
  },
  {
    candidate: MOK_CANDIDATE_1,
    schedule: [],
    id: 2,
  },
  {
    candidate: MOK_CANDIDATE_2,
    schedule: [],
    id: 3,
  },
  {
    candidate: MOK_CANDIDATE_2,
    schedule: [],
    id: 3,
  },
  {
    candidate: MOK_CANDIDATE_2,
    schedule: [],
    id: 3,
  },  {
    candidate: MOK_CANDIDATE_2,
    schedule: [],
    id: 3,
  },
  {
    candidate: MOK_CANDIDATE_2,
    schedule: [],
    id: 3,
  },
  {
    candidate: MOK_CANDIDATE_2,
    schedule: [],
    id: 3,
  },  {
    candidate: MOK_CANDIDATE_2,
    schedule: [],
    id: 3,
  },  {
    candidate: MOK_CANDIDATE_2,
    schedule: [],
    id: 3,
  },  {
    candidate: MOK_CANDIDATE_2,
    schedule: [],
    id: 3,
  },
  {
    candidate: MOK_CANDIDATE_2,
    schedule: [],
    id: 3,
  },
  {
    candidate: MOK_CANDIDATE_2,
    schedule: [],
    id: 3,
  },
  {
    candidate: MOK_CANDIDATE_2,
    schedule: [],
    id: 3,
  },
  {
    candidate: MOK_CANDIDATE_2,
    schedule: [],
    id: 3,
  },  {
    candidate: MOK_CANDIDATE_2,
    schedule: [],
    id: 3,
  },
  {
    candidate: MOK_CANDIDATE_2,
    schedule: [],
    id: 3,
  },  {
    candidate: MOK_CANDIDATE_2,
    schedule: [],
    id: 3,
  },  {
    candidate: MOK_CANDIDATE_2,
    schedule: [],
    id: 3,
  },  {
    candidate: MOK_CANDIDATE_2,
    schedule: [],
    id: 3,
  },  {
    candidate: MOK_CANDIDATE_2,
    schedule: [],
    id: 3,
  },  {
    candidate: MOK_CANDIDATE_2,
    schedule: [],
    id: 3,
  },  {
    candidate: MOK_CANDIDATE_2,
    schedule: [],
    id: 3,
  },  {
    candidate: MOK_CANDIDATE_2,
    schedule: [],
    id: 3,
  },
  {
    candidate: MOK_CANDIDATE_2,
    schedule: [],
    id: 3,
  },













];
