import { OrderJobDistribution } from "@shared/enums/job-distibution";

export const TIER_LOGIC = { id: OrderJobDistribution.TierLogic, name: 'Tiering logic' };

export const ORDER_JOB_DISTRIBUTION = [
  { id: OrderJobDistribution.All, name: 'All' },
  { id: OrderJobDistribution.Selected, name: 'Selected' },
];

export const distributionSource = (isSelect: boolean) => {
  return isSelect ?
    [ORDER_JOB_DISTRIBUTION[0], TIER_LOGIC, ORDER_JOB_DISTRIBUTION[1]] : ORDER_JOB_DISTRIBUTION;
};
