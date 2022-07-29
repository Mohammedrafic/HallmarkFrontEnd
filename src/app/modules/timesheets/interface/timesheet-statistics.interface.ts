import { HourOccupationType } from '../enums';

export interface TimesheetStatistics {
  weekHours: number;
  cumulativeHours: number;
  weekMiles: number;
  cumulativeMiles: number;
  weekCharge: number;
  cumulativeCharge: number;
  timesheetStatisticDetails: TimesheetStatisticsDetails[];
}

export interface TimesheetStatisticsDetails {
  billRateConfigId: number;
  billRateConfigName: HourOccupationType;
  weekHours: number;
  cumulativeHours: number;
}
