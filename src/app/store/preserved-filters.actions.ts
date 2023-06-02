import { FilterPageName } from '@core/enums/filter-page-name.enum';

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
  constructor(public pageName: FilterPageName) {}
}

export class ResetPageFilters {
  static readonly type = '[preserved filters] Reset Page Filters';
}
