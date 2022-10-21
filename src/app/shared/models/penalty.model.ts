import { JobCancellationReason, PenaltyCriteria } from "@shared/enums/candidate-cancellation";
import { PageOfCollections } from "@shared/models/page.model";

export type Penalty = {
  candidateCancellationSettingId: number;
  reason: JobCancellationReason;
  regionName: string;
  regionId: number;
  locationName: string;
  locationId: number;
  flatRate: number;
  rateOfHours: number;
  flatRateOfHoursPercentage: number;
  flatRateOfHours: number;
  penaltyCriteria?: boolean;
}

export type PenaltyPayload = {
  candidateCancellationSettingId: number;
  reason: JobCancellationReason;
  regionIds: number[];
  locationIds: number[];
  penaltyCriteria: PenaltyCriteria;
  flatRate: number;
  rateOfHours: number;
  flatRateOfHoursPercentage: number;
  flatRateOfHours: number;
  forceUpsert?: boolean;
}

export type PenaltyPage = PageOfCollections<Penalty>;
