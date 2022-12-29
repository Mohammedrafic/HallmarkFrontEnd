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

export enum ScheduleType {
  Book = 'Book',
  Availability = 'Availability',
  Unavailability = 'Unavailability',
}

export enum ScheduleOrderType {
  ContractToPerm = 'ContractToPerm',
  OpenPerDiem = 'OpenPerDiem',
  PermPlacement = 'PermPlacement',
  Traveler = 'Traveler',
  ReOrder = 'ReOrder',
}
