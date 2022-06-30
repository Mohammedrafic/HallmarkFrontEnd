import { HourOccupationType } from "../enums/hour-occupation-type.enum";

export interface ProfileHoursChartData {
  type: HourOccupationType;
  weekly: number;
  total: number;
}

export const mockedHoursChartData: ProfileHoursChartData [] = [
  {
    type: HourOccupationType.OnCall,
    weekly: 32.47,
    total: 52.47,
  },
  {
    type: HourOccupationType.Callback,
    weekly: 2.5,
    total: 42.5,
  },
  {
    type: HourOccupationType.Regular,
    weekly: 36,
    total: 76,
  },
  {
    type: HourOccupationType.Holiday,
    weekly: 36,
    total: 76,
  },
  {
    type: HourOccupationType.Charge,
    weekly: 0,
    total: 0,
  },
  {
    type: HourOccupationType.Preceptor,
    weekly: 36,
    total: 66,
  },
  {
    type: HourOccupationType.Orientation,
    weekly: 36,
    total: 36,
  }
];
