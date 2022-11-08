import { PreservedFilters, PreservedFiltersGlobal } from "@shared/models/preserved-filters.model";

export class InitPreservedFilters {
  static readonly type = '[preserved filters] Load preserved filters from the server';
  constructor() { }
}
 
export class SetPreservedFilters {
  static readonly type = '[preserved filters] Save or update preserved filters';
  constructor(public payload: PreservedFilters | PreservedFiltersGlobal, public isGlobal: boolean = false) { }
}