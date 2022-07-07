import { ExportPayload } from "@shared/models/export.model";
import { TimesheetDetailsActions } from "../../enums";

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

  export class GetTimesheetRecords {
    static readonly type = TimesheetDetailsActions.GetTimesheetRecords;

    constructor(public readonly id: number) {}
  }

  export class GetCandidateInfo {
    static readonly type = TimesheetDetailsActions.GetCandidateInfo;
    constructor(public id: number) {}
  }

  export class GetCandidateChartData {
    static readonly type = TimesheetDetailsActions.GetCandidateChartData;
    constructor(public id: number) {}
  }

  export class GetCandidateAttachments {
    static readonly type = TimesheetDetailsActions.GetCandidateAttachments;
    constructor(public id: number) {}
  }
}
