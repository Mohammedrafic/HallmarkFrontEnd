export interface DashboardFiltersModel {
  regionIds?: number[];
  locationIds?: number[];
  departmentsIds?: number[];
  skillIds?: number[];
}

export type FilterName = 'Region' | 'Location' | 'Department' | 'Skill';

export type FilterColumn = 'regionIds' | 'locationIds' | 'departmentsIds' | 'skillIds';
