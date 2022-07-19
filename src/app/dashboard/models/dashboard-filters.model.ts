export type DashboardFiltersModel = Record<FilterColumn, number[]>;

export type FilterName = 'Region' | 'Location' | 'Department' | 'Skill';

export type FilterColumn = 'regionIds' | 'locationIds' | 'departmentsIds' | 'skillIds';
