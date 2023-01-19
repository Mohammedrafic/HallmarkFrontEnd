import { Order } from '@shared/models/order-management.model';
import { JobDistributionModel } from '@shared/models/job-distribution.model';

export const getAgencyNameList = (order: Order) => {
  if(order?.allAgencies) {
    return { name: 'All', tooltip: '' };
  }

  const agencyList = order.jobDistributions
    .map((distribution: JobDistributionModel) => distribution.agencyName)
    .filter(name => name);
  const agenciesWithSeparator = agencyList?.join(', ');

  switch (true) {
    case agencyList?.length === 1:
      return { name: agencyList[0] as string, tooltip: '' };
    case agencyList?.length === 2:
      return { name: agenciesWithSeparator, tooltip: '' };
    case agencyList?.length >= 3:
      return { name: `Multiple Agencies ${agencyList?.length}`, tooltip: agenciesWithSeparator };
    default:
      return { name: 'All', tooltip: '' };
  }
};
