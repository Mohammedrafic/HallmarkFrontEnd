import { CandidateHoursData, DonutChartData } from '../interface';
import { HourOccupationType } from '../enums';

export class CandidateBarChartHelper {
  public static toWeekHoursChartData({type, week: week}: CandidateHoursData): DonutChartData<HourOccupationType> {
    return {
      x: type,
      y: week,
    };
  }

  public static toCumulativeHoursChartData({type, cumulative}: CandidateHoursData): DonutChartData<HourOccupationType> {
    return {
      x: type,
      y: cumulative,
    };
  }
}
