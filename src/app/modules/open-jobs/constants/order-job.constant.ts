import { OrderJobType } from '@shared/enums';
import { GetLocalDate } from '@shared/helpers';

import { FiltersState, PageSettings } from '../interfaces';

export const JobPageSettings: PageSettings = {
  pageNumber: 1,
  pageSize: 100,
};

export const AllOrderTypeOption = 0;
export const AppliedWorkflowStep = 10;
export const WithdrawnWorkflowStep = 35;
export const AvailabilityScheduleType = 1;
export const AppliedMessage = 'You have been applied';
export const WithdrawnMessage = 'You have been withdrawn';

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
