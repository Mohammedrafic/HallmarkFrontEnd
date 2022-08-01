import { FilterColumnTypeEnum } from "../enums/dashboard-filter-fields.enum";

export type DashboardFiltersModel = Record<FilterColumnTypeEnum, number[]>;

export type FilterName = 'Organization' | 'Region' | 'Location' | 'Department' | 'Skill';
