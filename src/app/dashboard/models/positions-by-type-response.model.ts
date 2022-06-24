export interface PositionsByTypeResponseModel {
  openJobs: PositionByTypeDto[];
  onboardCandidates: PositionByTypeDto[];
  closedJobs: PositionByTypeDto[];
}

export interface PositionByTypeDto{
  month: number;
  value: number
}