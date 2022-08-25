import { JobDistribution } from "@shared/enums/job-distibution";

export const ORDER_JOB_DISTRIBUTION_LIST = [
  { id: JobDistribution.All, name: 'All' },
  { id: JobDistribution.Internal, name: 'Internal' },
  { id: JobDistribution.ExternalTier1, name: 'External Tier 1' },
  { id: JobDistribution.ExternalTier2, name: 'External Tier 2' },
  { id: JobDistribution.ExternalTier3, name: 'External Tier 3' },
  { id: JobDistribution.Selected, name: 'Selected' },
];
