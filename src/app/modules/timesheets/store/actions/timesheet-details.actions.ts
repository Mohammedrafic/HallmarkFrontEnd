import { ExportPayload } from "@shared/models/export.model";

export namespace TimesheetDetails {
  export class Export {
    static readonly type = '[timesheet details] Export';
    constructor(public payload: ExportPayload) { }
  }

  // export class AddFile {
  //   static readonly type = '[timesheet details] Add file';
  //   constructor(public payload: ProfileUploadedFile) { }
  // }

  // export class RemoveFile {
  //   static readonly type = '[timesheet details] Remove file';
  //   constructor(public payload: ProfileUploadedFile) { }
  // }
}
