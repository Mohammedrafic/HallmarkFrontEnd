export enum TabTitleConfig {
  Scheduling = 'Scheduling',
  Analytics = 'Analytics',
}

export enum ActiveTabIndex {
  Scheduling,
  Analytics,
}

export enum DatePeriodId {
  Day = 'Day',
  Week = 'Week',
  TwoWeeks = '2 Weeks',
  Month = 'Month',
}

export enum ScheduleCandidateType {
  Default = 'Default',
  Urgent = 'Urgent',
  NotFilled = 'NotFilled',
}

export enum ScheduleType {
  Available = 'Available',
  Unavailable = 'Unavailable',
  Normal = 'Normal',
}

export enum ScheduleOrderType {
  LTA = 'LTA',
  PD = 'PD',
  NO = '',
}
