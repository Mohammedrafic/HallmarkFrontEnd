import { JobDistribution, OrderJobDistribution } from "@shared/enums/job-distibution";

export const ORDER_JOB_DISTRIBUTION_LIST = [
  { id: JobDistribution.All, name: 'All' },
  { id: JobDistribution.ExternalTier1, name: 'External Tier 1' },
  { id: JobDistribution.ExternalTier2, name: 'External Tier 2' },
  { id: JobDistribution.ExternalTier3, name: 'External Tier 3' },
  { id: JobDistribution.Internal, name: 'Internal' },
  { id: JobDistribution.Selected, name: 'Selected' },
];

export const TIER_LOGIC = { id: OrderJobDistribution.TierLogic, name: 'Tiering logic' };

export const ORDER_JOB_DISTRIBUTION = [
  { id: OrderJobDistribution.All, name: 'All' },
  { id: OrderJobDistribution.Selected, name: 'Selected' },
];

export const distributionSource = (isSelect: boolean) => {
  return isSelect ?
    [ORDER_JOB_DISTRIBUTION[0], TIER_LOGIC, ORDER_JOB_DISTRIBUTION[1]] : ORDER_JOB_DISTRIBUTION;
};
