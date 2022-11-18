export enum JobDistribution {
  All,
  Internal,
  ExternalTier1,
  ExternalTier2,
  ExternalTier3,
  Selected,
}

export enum OrderJobDistribution {
  All = 0,
  TierLogic = 1,
  Selected = 2,
}
