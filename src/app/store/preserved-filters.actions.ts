import { FilterPageName } from '@core/enums/filter-page-name.enum';
import { PreservedFilters, PreservedFiltersGlobal } from '@shared/models/preserved-filters.model';

 //TODO remove after implementing preserving filters by page
export class InitPreservedFilters {
  static readonly type = '[preserved filters] Load preserved filters from the server';
  constructor() {}
}

 //TODO remove after implementing preserving filters by page
export class SetPreservedFilters {
  static readonly type = '[preserved filters] Save or update preserved filters';
  constructor(public payload: PreservedFilters | PreservedFiltersGlobal, public isGlobal: boolean = false) {}
}

 //TODO remove after implementing preserving filters by page
export class SetPreservedFiltersForTimesheets {
  static readonly type = '[preserved filters] Save or update preserved filters for the timesheets';
  constructor(public payload: PreservedFilters) {}
}

export class SaveFiltersByPageName {
  static readonly type = '[preserved filters] Save Page Filters';
  constructor(public pageName: FilterPageName, public filterState: unknown) {}
}

export class GetPreservedFiltersByPage {
  static readonly type = '[preserved filters] Get Preserved Page Filters';
  constructor(public pageName: FilterPageName) {}
}

export class ClearPageFilters {
  static readonly type = '[preserved filters] Clear Page Filters';
}
