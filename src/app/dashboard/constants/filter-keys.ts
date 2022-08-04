import { FilterColumnTypeEnum } from "../enums/dashboard-filter-fields.enum";
import { FilterName } from "../models/dashboard-filters.model";

export const FilterKeys: Record<FilterColumnTypeEnum, FilterName> = {
  [FilterColumnTypeEnum.ORGANIZATION]: 'Organization',
  [FilterColumnTypeEnum.REGION]: 'Region',
  [FilterColumnTypeEnum.LOCATION]: 'Location',
  [FilterColumnTypeEnum.DEPARTMENT]: 'Department',
  [FilterColumnTypeEnum.SKILL]: 'Skill',
};
