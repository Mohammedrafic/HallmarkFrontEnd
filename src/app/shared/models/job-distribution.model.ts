import { JobDistribution } from '@shared/enums/job-distibution';

export class JobDistributionModel {
  id: number;
  orderId: number;
  jobDistributionOption: JobDistribution;
  agencyId: number | null;
  agencyName?: string;
}
