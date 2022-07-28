export type DashboardFiltersModel = Record<FilterColumn, number[]>;

export type FilterName = 'Organization' | 'Region' | 'Location' | 'Department' | 'Skill';

export type FilterColumn = 'organizationIds' | 'regionIds' | 'locationIds' | 'departmentsIds' | 'skillIds';
