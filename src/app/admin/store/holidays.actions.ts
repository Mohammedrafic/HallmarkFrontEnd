import { ExportPayload } from "@shared/models/export.model";
import { Holiday } from "@shared/models/holiday.model";

export class GetHolidaysByPage {
  static readonly type = '[holiday] Get Holiday by Page';
  constructor(public pageNumber: number, public pageSize: number) { }
}

export class SaveHoliday {
  static readonly type = '[holiday] Save Holiday';
  constructor(public payload: Holiday) {}
}

export class SaveHolidaySucceeded {
  static readonly type = '[holiday] Save Holiday Succeeded';
  constructor(public payload: Holiday) {}
}

export class DeleteHoliday {
  static readonly type = '[holiday] Remove Holiday';
  constructor(public payload: Holiday) { }
}

export class DeleteHolidaySucceeded {
  static readonly type = '[holiday] Remove Holiday Succeeded';
  constructor(public payload: Holiday) { }
}

export class SetYearFilter {
  static readonly type = '[holiday] Set Holiday Year Filter';
  constructor(public payload: number) { }
}

export class FilterChanged {
  static readonly type = '[holiday] Emit Filter Change';
  constructor() { }
}

export class ExportHolidays {
  static readonly type = '[holiday] Export Holiday list';
  constructor(public payload: ExportPayload) { }
}
