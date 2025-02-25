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
  OpenPositions = 'Open Positions'
}

export enum ScheduleOrderType {
  ContractToPerm = 'ContractToPerm',
  OpenPerDiem = 'OpenPerDiem',
  PermPlacement = 'PermPlacement',
  LongTermAssignment = 'LongTermAssignment',
  ReOrder = 'ReOrder',
}

export enum ScheduleAttributeKeys {
 ORI = 'ORI',
 CRT = 'CRT',
 OC = 'OC',
 CHG = 'CHG',
 PRC= 'PRC',
}

export enum ScheduleAttributeTitles {
  ORI = 'Orientation',
  CRT = 'Critical',
  OC = 'On Call',
  CHG = 'Charge',
  PRC= 'Preceptor',
  MEAL = 'Meal break',
}

export enum EmployeeIcons {
  Compass = 'compass',
  Flag = 'flag',
}
