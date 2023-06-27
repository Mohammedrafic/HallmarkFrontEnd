/* eslint-disable @typescript-eslint/no-namespace */
import { ExportPayload } from '@shared/models/export.model';
import { TimesheetDetailsActions, TIMESHEETS_ACTIONS } from '../../enums';
import {
  ChangeStatusData,
  DeleteAttachmentData,
  DownloadAttachmentData,
  TimesheetUploadFilesData,
  AddRecordDto,
  PutRecordDto,
} from '../../interface';

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

  export class AgencySubmitTimesheet {
    static readonly type = TIMESHEETS_ACTIONS.AGENCY_SUBMIT_TIMESHEET;

    constructor(
      public readonly id: number,
      public readonly orgId: number,
    ) {
    }
  }

  export class OrganizationApproveTimesheet {
    static readonly type = TIMESHEETS_ACTIONS.ORGANIZATION_APPROVE_TIMESHEET;

    constructor(
      public readonly id: number,
      public readonly orgId: number | null,
    ) {
    }
  }

  export class ChangeTimesheetStatus {
    static readonly type = TIMESHEETS_ACTIONS.REJECT_TIMESHEET;

    constructor(
      public readonly payload: ChangeStatusData
    ) {
    }
  }

  export class PutTimesheetRecords {
    static readonly type = TimesheetDetailsActions.PatchTimesheetRecords;

    constructor(
      public readonly body: PutRecordDto,
      public readonly isAgency: boolean,
      ) {}
  }

  export class UploadFiles {
    static readonly type = TimesheetDetailsActions.UploadFiles;

    constructor(public readonly payload: TimesheetUploadFilesData) {
    }
  }

  export class DeleteAttachment {
    static readonly type = TimesheetDetailsActions.DeleteFile;

    constructor(public readonly payload: DeleteAttachmentData) {
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

  export class DownloadAttachment {
    static readonly type = TimesheetDetailsActions.DownloadAttachment;

    constructor(
      public readonly payload: DownloadAttachmentData,
    ) {}
  }

  export class AddTimesheetRecord {
    static readonly type = TimesheetDetailsActions.AddTimesheetRecord;

    constructor(
      public readonly body: AddRecordDto,
      public readonly isAgency: boolean,
    ) {}
  }
  
  export class AddTimesheetRecordSucceed {
    static readonly type = TimesheetDetailsActions.AddTimesheetRecordSucceed;

    constructor() {}
  }

  export class NoWorkPerformed {
    static readonly type = TimesheetDetailsActions.NoWorkPerformed;

    constructor(
      public readonly noWorkPerformed: boolean,
      public readonly timesheetId: number,
      public readonly organizationId: number | null,
    ) {}
  }

  export class GetDetailsByDate {
    static readonly type = TimesheetDetailsActions.GetDetailsByDate;

    constructor(
      public readonly orgId: number,
      public readonly startdate: string,
      public readonly jobId: number,
      public readonly isAgency: boolean,
    ) {}
  }

  export class RecalculateTimesheets {
    static readonly type = TimesheetDetailsActions.RecalculateTimesheets;

    constructor(public readonly jobId: number) {}
  }

  export class ForceAddRecord {
    static readonly type = TimesheetDetailsActions.ForceAddRecord;

    constructor(public readonly force: boolean, public readonly message?: string, public readonly title?: string) {}
  }

  export class ForceUpdateRecord {
    static readonly type = TimesheetDetailsActions.ForceUpdateRecords;

    constructor(public readonly force: boolean, public readonly message?: string, public readonly title?: string) {}
  }
}
