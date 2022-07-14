import { DonutChartData, TimesheetStatisticsDetails } from '../interface';
import { HourOccupationType } from '../enums';

export class CandidateBarChartHelper {
  public static toWeekHoursChartData(
    { billRateConfigName: type, weekHours: week }: TimesheetStatisticsDetails
  ): DonutChartData<HourOccupationType> {
    return {
      x: type,
      y: week,
    };
  }

  public static toCumulativeHoursChartData(
    { billRateConfigName: type, cumulativeHours: cumulative }: TimesheetStatisticsDetails
  ): DonutChartData<HourOccupationType> {
    return {
      x: type,
      y: cumulative,
    };
  }
}
