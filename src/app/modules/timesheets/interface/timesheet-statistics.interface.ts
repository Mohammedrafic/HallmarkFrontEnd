import { HourOccupationType } from '../enums';

export interface TimesheetStatistics {
  weekHours: number;
  cumulativeHoursByOrder:number;
  weekMiles:number;
  cumulativeMilesByOrder:number;
  weekCharge:number;
  cumulativeChargeByOrder:number;
  timesheetStatisticDetails: TimesheetStatisticsDetails[];
}

export interface TimesheetStatisticsDetails {
  // TODO: Rename to billRateId
  billRateConfigId: number;
  billRateConfigName: HourOccupationType;
  weekHours: number;
  cumulativeHours: number;
}
