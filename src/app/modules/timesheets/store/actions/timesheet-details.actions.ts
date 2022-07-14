import { ExportPayload } from '@shared/models/export.model';
import { TimesheetDetailsActions, TIMESHEETS_ACTIONS } from '../../enums';

export namespace TimesheetDetails {
  export class Export {
    static readonly type = '[timesheet details] Export';
    constructor(public payload: ExportPayload) { }
  }

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

  export class GetCandidateInvoices {
    static readonly type = TimesheetDetailsActions.GetCandidateInvoices;

    constructor(public id: number) {
    }
  }

  export class AgencySubmitTimesheet {
    static readonly type = TIMESHEETS_ACTIONS.AGENCY_SUBMIT_TIMESHEET;

    constructor(
      public readonly id: number,
    ) {
    }
  }

  export class OrganizationApproveTimesheet {
    static readonly type = TIMESHEETS_ACTIONS.ORGANIZATION_APPROVE_TIMESHEET;

    constructor(
      public readonly id: number,
    ) {
    }
  }

  export class RejectTimesheet {
    static readonly type = TIMESHEETS_ACTIONS.REJECT_TIMESHEET;

    constructor(
      public readonly id: number,
      public readonly reason: string,
    ) {
    }
  }

  export class PatchTimesheetRecords {
    static readonly type = TimesheetDetailsActions.PatchTimesheetRecords;

    constructor(public readonly id: number,public readonly recordsToUpdate: Record<string, string | number>[]) {}
  }

  export class UploadFiles {
    static readonly type = TimesheetDetailsActions.UploadFiles;

    // TODO: Remove names property after connection with API
    constructor(public id: number, public files: Blob[], public names: string[]) {
    }
  }

  export class DeleteFile {
    static readonly type = TimesheetDetailsActions.DeleteFile;

    constructor(public id: number) {
    }
  }
}
