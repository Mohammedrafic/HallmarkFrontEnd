import { ExportPayload } from "@shared/models/export.model";

export namespace TimesheetDetails {
  export class Export {
    static readonly type = '[timesheet details] Export';
    constructor(public payload: ExportPayload) { }
  }
}
