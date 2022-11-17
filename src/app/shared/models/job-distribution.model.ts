import { JobDistribution, OrderJobDistribution } from '@shared/enums/job-distibution';

export class JobDistributionModel {
  id: number;
  orderId: number;
  jobDistributionOption: JobDistribution | OrderJobDistribution;
  agencyId: number | null;
  agencyName?: string;
}
