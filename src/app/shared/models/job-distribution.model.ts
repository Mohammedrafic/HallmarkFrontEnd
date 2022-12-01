import { OrderJobDistribution } from '@shared/enums/job-distibution';

export class JobDistributionModel {
  id: number;
  orderId: number;
  jobDistributionOption: OrderJobDistribution;
  agencyId: number | null;
  agencyName?: string;
}
