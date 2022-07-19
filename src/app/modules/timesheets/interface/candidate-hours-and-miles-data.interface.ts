import { HourOccupationType } from '../enums';

export interface CandidateHoursAndMilesData {
  hours: CandidateHoursData[];
  miles: CandidateMilesData | null;
}

export interface CandidateHoursData {
  type: HourOccupationType;
  week: number;
  cumulative: number;
}

export interface CandidateMilesData {
  week: number;
  cumulative: number;
  weekCharge: number;
  cumulativeCharge: number;
}
