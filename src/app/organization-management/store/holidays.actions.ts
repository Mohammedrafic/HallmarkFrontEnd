import { OrganizationHoliday } from "@shared/models/holiday.model";

export class GetHolidaysByPage {
  static readonly type = '[orgHoliday] Get Holiday by Page';
  constructor(public pageNumber: number, public pageSize: number) { }
}

export class SaveHoliday {
  static readonly type = '[orgHoliday] Save Holiday';
  constructor(public payload: OrganizationHoliday) {}
}

export class SaveHolidaySucceeded {
  static readonly type = '[orgHoliday] Save Holiday Succeeded';
  constructor(public payload: OrganizationHoliday) {}
}

export class DeleteHoliday {
  static readonly type = '[orgHoliday] Remove Holiday';
  constructor(public payload: OrganizationHoliday) { }
}

export class DeleteHolidaySucceeded {
  static readonly type = '[orgHoliday] Remove Holiday Succeeded';
  constructor(public payload: OrganizationHoliday) { }
}

export class FilterChanged {
  static readonly type = '[orgHoliday] Emit Filter Change';
  constructor() { }
}
