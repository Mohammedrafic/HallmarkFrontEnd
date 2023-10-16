import { FiledNamesSettings } from '@shared/constants/base-dropdown-fields-settings';

export const createDepartmentsTier = (
  organizationId: number,
  regionIds?: number[],
  locationIds?: number[],
  departmentIds?: number[],
  allRecords?: FiledNamesSettings) => {
  return {
    organizationId: organizationId ?? null,
    regionIds: allRecords?.regionIds ? null : regionIds ?? [],
    locationIds: allRecords?.locationIds ? null : locationIds ?? [],
    departmentIds: allRecords?.departmentIds ? null : departmentIds ?? [],
  };
};
