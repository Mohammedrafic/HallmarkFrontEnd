import { HourOccupationType } from '../enums';
import { TimesheetStatisticsDetails } from '../interface';

export function getEmptyHoursOccupationData(name: string): TimesheetStatisticsDetails {
  return {
    billRateConfigName: name as HourOccupationType,
    cumulativeHours: 0,
    weekHours: 0,
    billRateConfigId: Math.random(),
  };
}
