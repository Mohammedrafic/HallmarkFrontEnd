import { ExportPayload } from '@shared/models/export.model';
import { TimesheetDetailsActions, TIMESHEETS_ACTIONS } from '../../enums';

export namespace TimesheetDetails {
  export class Export {
    static readonly type = '[timesheet details] Export';
    constructor(public readonly payload: ExportPayload) { }
  }

  export class GetTimesheetRecords {
    static readonly type = TimesheetDetailsActions.GetTimesheetRecords;

    constructor(
      public readonly id: number,
      public readonly orgId: number,
      public readonly isAgency: boolean,
      ) {}
  }

  export class GetCandidateInfo {
    static readonly type = TimesheetDetailsActions.GetCandidateInfo;
    constructor(public readonly id: number) {}
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

    constructor(
      public readonly id: number,
      public readonly recordsToUpdate: Record<string, string | number>[],
      public readonly isAgency: boolean,
      ) {}
  }

  export class UploadFiles {
    static readonly type = TimesheetDetailsActions.UploadFiles;

    // TODO: Remove names property after connection with API
    constructor(public readonly id: number, public readonly files: Blob[], public readonly names: string[]) {
    }
  }

  export class DeleteFile {
    static readonly type = TimesheetDetailsActions.DeleteFile;

    constructor(public readonly id: number) {
    }
  }

  export class GetBillRates {
    static readonly type = TimesheetDetailsActions.GetCandidateBillRates;

    constructor(
      public readonly jobId: number,
      public readonly orgId: number,
      public readonly isAgency: boolean,
    ) {}
  }

  export class GetCostCenters {
    static readonly type = TimesheetDetailsActions.GetCandidateCostCenters;

    constructor(
      public readonly jobId: number,
      public readonly orgId: number,
      public readonly isAgency: boolean,
    ) {}
  }

  export class AddTimesheetRecord {
    static readonly type = TimesheetDetailsActions.AddTimesheetRecord;

    constructor(
      public timesheetId: number,
    ) {}
  }
}
