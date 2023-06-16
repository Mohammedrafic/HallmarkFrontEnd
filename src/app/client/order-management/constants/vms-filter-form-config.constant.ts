import { OrganizationOrderManagementTabs } from '@shared/enums/order-management-tabs.enum';
import { CommonFormConfig } from '@shared/models/common-form-config.model';

export const GetVMSFilterFormConfig = (tab: OrganizationOrderManagementTabs): CommonFormConfig[] => {
  switch (tab) {
    case OrganizationOrderManagementTabs.AllOrders:
      return AllOrdersFilterFormConfig;
    case OrganizationOrderManagementTabs.PerDiem:
      return PerdiemFormConfig;
    case OrganizationOrderManagementTabs.PermPlacement:
      return PermPlacementFormConfig;
    case OrganizationOrderManagementTabs.ReOrders:
      return ReorderFormConfig;
    case OrganizationOrderManagementTabs.Incomplete:
      return IncompleteFilterFormConfig;
    case OrganizationOrderManagementTabs.OrderTemplates:
      return TemplatesFilterFormConfig;
    default:
      return AllOrdersFilterFormConfig;
  }
};

const CommonFields: CommonFormConfig[] = [
  { field: 'orderPublicId' },
  { field: 'regionIds' },
  { field: 'locationIds' },
  { field: 'departmentsIds' },
  { field: 'skillIds' },
  { field: 'shift' },
];

const AllOrdersFilterFormConfig: CommonFormConfig[] = [
  ...CommonFields,
  { field: 'orderTypes' },
  { field: 'jobTitle' },
  { field: 'billRateFrom' },
  { field: 'billRateTo' },
  { field: 'openPositions' },
  { field: 'jobStartDate' },
  { field: 'jobEndDate' },
  { field: 'orderStatuses' },
  { field: 'candidateStatuses' },
  { field: 'candidatesCountFrom' },
  { field: 'candidatesCountTo' },
  { field: 'agencyIds' },
  { field: 'agencyType' },
  { field: 'templateTitle' },
  { field: 'creationDateFrom' },
  { field: 'creationDateTo' },
  { field: 'distributedOnFrom' },
  { field: 'distributedOnTo' },
  { field: 'candidateName' },
  { field: 'projectTypeIds' },
  { field: 'projectNameIds' },
  { field: 'poNumberIds' },
  { field: 'contactEmails' },
];

const PerdiemFormConfig: CommonFormConfig[] = [
  ...CommonFields,
  { field: 'agencyIds' },
  { field: 'orderStatuses' },
  { field: 'candidateName' },
  { field: 'candidateStatuses' },
  { field: 'contactEmails' },
  { field: 'projectTypeIds' },
  { field: 'projectNameIds' },
  { field: 'poNumberIds' },
  { field: 'jobTitle' },
  { field: 'creationDateFrom' },
  { field: 'creationDateTo' },
  { field: 'distributedOnFrom' },
  { field: 'distributedOnTo' },
  { field: 'agencyType' },
];

const PermPlacementFormConfig: CommonFormConfig[] = [
  ...CommonFields,
  { field: 'orderStatuses' },
  { field: 'candidateName' },
  { field: 'contactEmails' },
  { field: 'projectTypeIds' },
  { field: 'projectNameIds' },
  { field: 'poNumberIds' },
  { field: 'jobTitle' },
  { field: 'candidatesCountFrom' },
  { field: 'candidatesCountTo' },
  { field: 'openPositions' },
  { field: 'annualSalaryRangeFrom' },
  { field: 'annualSalaryRangeTo' },
  { field: 'jobStartDate' },
  { field: 'creationDateFrom' },
  { field: 'creationDateTo' },
  { field: 'distributedOnFrom' },
  { field: 'distributedOnTo' },
  { field: 'agencyType' },
];

const ReorderFormConfig: CommonFormConfig[] = [
  ...CommonFields,
  { field: 'agencyIds' },
  { field: 'orderStatuses' },
  { field: 'candidateName' },
  { field: 'candidateStatuses' },
  { field: 'contactEmails' },
  { field: 'projectTypeIds' },
  { field: 'projectNameIds' },
  { field: 'poNumberIds' },
  { field: 'jobTitle' },
  { field: 'billRateFrom' },
  { field: 'billRateTo' },
  { field: 'candidatesCountFrom' },
  { field: 'candidatesCountTo' },
  { field: 'openPositions' },
  { field: 'jobStartDate' },
  { field: 'creationDateFrom' },
  { field: 'creationDateTo' },
  { field: 'distributedOnFrom' },
  { field: 'distributedOnTo' },
  { field: 'agencyType' },
];

const IncompleteFilterFormConfig: CommonFormConfig[] = [
  ...CommonFields,
  { field: 'agencyIds' },
  { field: 'orderTypes' },
  { field: 'orderStatuses' },
  { field: 'candidateName' },
  { field: 'candidateStatuses' },
  { field: 'contactEmails' },
  { field: 'projectTypeIds' },
  { field: 'projectNameIds' },
  { field: 'poNumberIds' },
  { field: 'jobTitle' },
  { field: 'billRateFrom' },
  { field: 'billRateTo' },
  { field: 'candidatesCountFrom' },
  { field: 'candidatesCountTo' },
  { field: 'openPositions' },
  { field: 'jobStartDate' },
  { field: 'jobEndDate' },
  { field: 'creationDateFrom' },
  { field: 'creationDateTo' },
  { field: 'distributedOnFrom' },
  { field: 'distributedOnTo' },
  { field: 'agencyType' },
];

const TemplatesFilterFormConfig: CommonFormConfig[] = [...CommonFields];
