import { FilterColumn, FilterName } from "../models/dashboard-filters.model";

export const FilterKeys: Record<FilterColumn, FilterName> = {
  organizationIds: 'Organization',
  regionIds: 'Region',
  locationIds: 'Location',
  departmentsIds: 'Department',
  skillIds: 'Skill',
};
