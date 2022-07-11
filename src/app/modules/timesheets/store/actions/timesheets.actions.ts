import { TIMESHEETS_ACTIONS, DialogAction, TimesheetsTableColumns } from '../../enums';
import { TimesheetsFilterState } from '../../interface';

export namespace Timesheets {
  export class GetAll {
    static readonly type = TIMESHEETS_ACTIONS.GET_TIMESHEETS;
  }

  export class ToggleCandidateDialog {
    static readonly type = TIMESHEETS_ACTIONS.OPEN_PROFILE;

    constructor(public readonly action: DialogAction, public readonly id?: number) {}
  }

  export class ToggleTimesheetAddDialog {
    static readonly type = TIMESHEETS_ACTIONS.OPEN_PROFILE_TIMESHEET_ADD_DIALOG;

    constructor(public readonly action: DialogAction) {}
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

  export class GetTabsCounts {
    static readonly type = TIMESHEETS_ACTIONS.GET_TABS_COUNTS;
  }

  export class SetFiltersDataSource {
    static readonly type = TIMESHEETS_ACTIONS.SET_FILTERS_DATA_SOURCE;

    constructor(public readonly payload: TimesheetsTableColumns[]) {
    }
  }

  export class UpdateFiltersState {
    static readonly type = TIMESHEETS_ACTIONS.UPDATE_FILTERS_STATE;

    constructor(public readonly payload?: TimesheetsFilterState) {
    }
  }
}
