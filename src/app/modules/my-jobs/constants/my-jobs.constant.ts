import { GetLocalDate } from '@shared/helpers';

import { FiltersState, PageSettings } from '../interfaces';

export const MyJobsPageSettings: PageSettings = {
  pageNumber: 1,
  pageSize: 100,
};

export const AllOrderTypeOption = 0;

export const DefaultFilterState: FiltersState = {
  employeeTime: GetLocalDate(),
  orderType: null,
  orderBy: null,
  ...MyJobsPageSettings,
};
