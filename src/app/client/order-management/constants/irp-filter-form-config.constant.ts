import { OrderManagementIRPTabsIndex } from "@shared/enums/order-management-tabs.enum";
import { CommonFormConfig } from "@shared/models/common-form-config.model";

export const GetIRPFilterFormConfig = (tab: OrderManagementIRPTabsIndex): CommonFormConfig[] => {
  switch (tab) {
    case OrderManagementIRPTabsIndex.AllOrders:
      return AllOrdersIRPFilterFormConfig;
    case OrderManagementIRPTabsIndex.Incomplete:
      return IncompleteIRPFilterFormConfig;
    default:
      return AllOrdersIRPFilterFormConfig;
  }
};

const CommonFields: CommonFormConfig[] = [
  { field: 'orderPublicId' },
  { field: 'regionIds' },
  { field: 'locationIds' },
  { field: 'departmentsIds' },
  { field: 'skillIds' },
];

const AllOrdersIRPFilterFormConfig: CommonFormConfig[] = [
  ...CommonFields,
  { field: 'orderTypes' },
  { field: 'orderStatuses' },
  { field: 'candidateName' },
  { field: 'contactEmails' },
  { field: 'projectNameIds' },
  { field: 'projectTypeIds' },
  { field: 'candidatesCountFrom' },
  { field: 'candidatesCountTo' },
  { field: 'openPositions' },
  { field: 'jobStartDate' },
  { field: 'jobEndDate' },
  { field: 'creationDateFrom' },
  { field: 'creationDateTo' },
  { field: 'distributedOnFrom' },
  { field: 'distributedOnTo' },
  { field: 'irpOnly' },
  { field: 'shiftIds' }
];

const IncompleteIRPFilterFormConfig: CommonFormConfig[] = [
  ...CommonFields,
  { field: 'contactEmails' },
  { field: 'projectNameIds' },
  { field: 'projectTypeIds' },
  { field: 'jobStartDate' },
  { field: 'jobEndDate' },
  { field: 'creationDateFrom' },
  { field: 'creationDateTo' },
  { field: 'distributedOnFrom' },
  { field: 'distributedOnTo' },
  { field: 'irpOnly' },
];
