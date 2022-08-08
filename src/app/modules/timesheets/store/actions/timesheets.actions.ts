import { OrganizationRegion } from '@shared/models/organization.model';
import { DialogAction } from '@core/enums';
import { DataSourceItem } from '@core/interface';

import { TIMESHEETS_ACTIONS, RecordFields, TimesheetsTableFiltersColumns } from '../../enums';
import { Timesheet, TimesheetsFilterState } from '../../interface';

import { TIMESHEETS_ACTIONS, DialogAction, RecordFields, TimesheetsTableFiltersColumns } from '../../enums';
import { DataSourceItem, Timesheet, TimesheetsFilterState } from '../../interface';

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
      public readonly dateTime: string) {}
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

    constructor(public readonly timesheetIds: number[]) {
    }
  }
}
