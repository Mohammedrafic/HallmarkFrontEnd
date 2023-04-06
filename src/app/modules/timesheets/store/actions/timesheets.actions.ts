/* eslint-disable @typescript-eslint/no-namespace */
import { OrganizationRegion } from '@shared/models/organization.model';
import { DialogAction } from '@core/enums';
import { DataSourceItem, FileForUpload } from '@core/interface';

import { RecordFields, TIMESHEETS_ACTIONS, TimesheetsTableFiltersColumns } from '../../enums';
import { Attachment, Timesheet, TimesheetAttachments, TimesheetsFilterState } from '../../interface';
import { RowNode } from '@ag-grid-community/core';
import { ExportPayload } from '@shared/models/export.model';

export namespace Timesheets {
  
  export class GetAll {
    static readonly type = TIMESHEETS_ACTIONS.GET_TIMESHEETS;
  }

  export class GetTabsCounts {
    static readonly type = TIMESHEETS_ACTIONS.GET_TABS_COUNTS;
  }

  export class ToggleCandidateDialog {
    static readonly type = TIMESHEETS_ACTIONS.OPEN_PROFILE;

    constructor(public readonly action: DialogAction, public readonly timesheet?: Timesheet) {}
  }

  export class ToggleTimesheetAddDialog {
    static readonly type = TIMESHEETS_ACTIONS.OPEN_PROFILE_TIMESHEET_ADD_DIALOG;

    constructor(
      public readonly action: DialogAction,
      public readonly type: RecordFields,
      public readonly startDate: string,
      public readonly endDate: string,
      public readonly orderConstCenterId: number | null,
    ) {}
  }

  export class ToggleTimesheetUploadAttachmentsDialog {
    static readonly type = TIMESHEETS_ACTIONS.TOGGLE_TIMESHEET_UPLOAD_ATTACHMENTS_DIALOG;

    constructor(
      public readonly action: DialogAction,
      public readonly timesheetAttachments: TimesheetAttachments | null,
    ) {}
  }

  export class UploadMilesAttachments {
    static readonly type = TIMESHEETS_ACTIONS.UPLOAD_MILES_ATTACHMENTS;

    constructor(
      public readonly files: FileForUpload[],
      public readonly organizationId: number | null = null
    ) {}
  }

  export class DeleteMilesAttachment {
    static readonly type = TIMESHEETS_ACTIONS.DELETE_MILES_ATTACHMENT;

    constructor(
      public readonly fileId: number,
      public readonly organizationId: number | null = null
    ) {}
  }

  export class PreviewAttachment {
    static readonly type = TIMESHEETS_ACTIONS.PREVIEW_ATTACHMENT;

    constructor(
      public readonly timesheetRecordId: number,
      public readonly organizationId: number | null,
      public readonly payload: Attachment,
    ) {}
  }

  export class DownloadRecordAttachment {
    static readonly type = TIMESHEETS_ACTIONS.DOWNLOAD_ATTACHMENT;

    constructor(
      public readonly timesheetRecordId: number,
      public readonly organizationId: number | null,
      public readonly payload: Attachment,
    ) {
    }
  }

  export class DeleteRecordAttachment {
    static readonly type = TIMESHEETS_ACTIONS.DELETE_ATTACHMENT;

    constructor(
      public readonly timesheetRecordId: number,
      public readonly organizationId: number | null,
      public readonly payload: Attachment,
    ) {
    }
  }

  export class CloseProfileTimesheetAddDialog {
    static readonly type = TIMESHEETS_ACTIONS.CLOSE_PROFILE_TIMESHEET_ADD_DIALOG;
  }

  export class PostProfileTimesheet {
    static readonly type = TIMESHEETS_ACTIONS.POST_PROFILE_TIMESHEET;

    constructor(public readonly payload: any) {
    }
  }

  export class PatchProfileTimesheet {
    static readonly type = TIMESHEETS_ACTIONS.PATCH_PROFILE_TIMESHEET;

    constructor(
      public readonly profileId: number | any,
      public readonly profileTimesheetId: number | any,
      public readonly payload: any
    ) {
    }
  }

  export class DeleteProfileTimesheet {
    static readonly type = TIMESHEETS_ACTIONS.DELETE_PROFILE_TIMESHEET;

    constructor(
      public readonly profileId: number | any,
      public readonly profileTimesheetId: number | any
    ) {
    }
  }

  export class GetFiltersDataSource {
    static readonly type = TIMESHEETS_ACTIONS.GET_FILTERS_DATA_SOURCE;
  }

  export class SetFiltersDataSource {
    static readonly type = TIMESHEETS_ACTIONS.SET_FILTERS_DATA_SOURCE;

    constructor(
      public readonly columnKey: TimesheetsTableFiltersColumns,
      public readonly dataSource: DataSourceItem[] | OrganizationRegion[]
    ) {
    }
  }

  export class UpdateFiltersState {
    static readonly type = TIMESHEETS_ACTIONS.UPDATE_FILTERS_STATE;

    constructor(
      public readonly payload?: TimesheetsFilterState | null,
      public readonly saveStatuses = false,
      public readonly saveOrganizationId = false,
      public readonly usePrevFiltersState = false,
    ) {
    }
  }

  export class ResetFiltersState {
    static readonly type = TIMESHEETS_ACTIONS.RESET_FILTERS_STATE;
  }

  export class DeleteTimesheet {
    static readonly type = TIMESHEETS_ACTIONS.DELETE_TIMESHEET;

    constructor(public timesheetId: number) {
    }
  }

  export class GetTimesheetDetails {
    static readonly type = TIMESHEETS_ACTIONS.GET_TIMESHEET_DETAILS;

    constructor(
      public timesheetId: number,
      public orgId: number,
      public isAgency: boolean,
      ) {
    }
  }

  export class GetOrganizations {
    static readonly type = TIMESHEETS_ACTIONS.GET_ORGANIZATIONS;
  }

  export class SelectOrganization {
    static readonly type = TIMESHEETS_ACTIONS.SELECT_ORGANIZATION;

    constructor(public readonly id: number) {
    }
  }

  export class BulkApprove {
    static readonly type = TIMESHEETS_ACTIONS.BULK_APPROVE;

    constructor(public readonly selectedTimesheets: RowNode[]) {
    }
  }
  export class ExportTimesheets {
    static readonly type = TIMESHEETS_ACTIONS.EXPORT_TIMESHEETS;

    constructor(
      public readonly payload: ExportPayload
    ) {
    }
  }

  export class ResetFilterOptions {
    static readonly type = TIMESHEETS_ACTIONS.RESET_FILTER_OPTIONS;
  }
}
