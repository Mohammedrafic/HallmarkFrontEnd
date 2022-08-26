import { HourOccupationType } from '../enums';
import { TimesheetStatisticsDetails } from '../interface';

/**
 * TODO: change to correct type
 */
export const reduceFiltersState = <T>(oldFilters: T, saveFiltersKeys: string[]): T => {
  return Object.keys(oldFilters).reduce((acc: any, key: string) => {
    if (saveFiltersKeys.includes(key)) {
      acc[key] = (oldFilters as any)[key];
    }

    return acc;
  }, {})
}

export function getEmptyHoursOccupationData(name: string): TimesheetStatisticsDetails {
  return {
    billRateConfigName: name as HourOccupationType,
    cumulativeHours: 0,
    weekHours: 0,
    billRateConfigId: Math.random(),
  };
}
