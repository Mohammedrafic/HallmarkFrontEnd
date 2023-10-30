import { OrderJobType } from '@shared/enums';
import { GetLocalDate } from '@shared/helpers';

import { FiltersState, PageSettings } from '../interfaces';

export const JobPageSettings: PageSettings = {
  pageNumber: 1,
  pageSize: 100,
};

export const AllOrderTypeOption = 0;

export const JobMessages = {
  appliedMessage: 'You have been applied',
  withdrawnMessage: 'You have been withdrawn',
  acceptMessage: 'You have been accepted',
  rejectMessage: 'You have been rejected',
};

export const OrderJobName: Record<number, string> = {
  [OrderJobType.LTA]: 'L',
  [OrderJobType.PerDiem]: 'D',
};

export const DefaultFilterState: FiltersState = {
  employeeTime: GetLocalDate(),
  orderType: null,
  orderBy: null,
  ...JobPageSettings,
};
