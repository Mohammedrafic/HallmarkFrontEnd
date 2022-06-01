import { ExportPayload } from "@shared/models/export.model";
import { OrganizationHoliday } from "@shared/models/holiday.model";

export class GetHolidaysByPage {
  static readonly type = '[orgHoliday] Get Holiday by Page';
  constructor(public pageNumber: number, public pageSize: number, public orderBy: string) { }
}

export class GetAllMasterHolidays {
  static readonly type = '[orgHoliday] Get All Master Holiday';
  constructor() { }
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

export class CheckIfExist {
  static readonly type = '[orgHoliday] Check If Exist';
  constructor(public payload: OrganizationHoliday) { }
}

export class ExportHolidays {
  static readonly type = '[orgHoliday] Export Holiday list';
  constructor(public payload: ExportPayload) { }
}
