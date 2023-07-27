import { OrderJobType } from '../enums';
import { FiltersState, PageSettings } from '../interfaces';
import { GetLocalDate } from '../helpers';

export const JobPageSettings: PageSettings = {
  pageNumber: 1,
  pageSize: 100,
};

export const AllOrderTypeOption = 0;
export const AppliedWorkflowStep = 10;
export const AvailabilityScheduleType = 1;
export const AppliedMessage = 'You have been applied';

export const OrderJobName: Record<number, string> = {
  [OrderJobType.LTA]: 'L',
  [OrderJobType.PerDiem]: 'P',
};

export const DefaultFilterState: FiltersState = {
  employeeTime: GetLocalDate(),
  orderType: null,
  orderBy: null,
  ...JobPageSettings,
};
