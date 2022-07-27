export interface PositionsByTypeResponseModel {
  openJobs: PositionByTypeDto[];
  onboardCandidates: PositionByTypeDto[];
  closedJobs: PositionByTypeDto[];
  inProgressJobs: PositionByTypeDto[];
}

export interface PositionByTypeDto{
  dateIndex: number;
  value: number
}