import { TIMESHEETS_ACTIONS, DialogAction } from '../../enums';
import { ITimesheetsFilter } from '../../interface';

export namespace Timesheets {
  export class GetAll {
    static readonly type = TIMESHEETS_ACTIONS.GET_TIMESHEETS;

    constructor(public readonly payload: ITimesheetsFilter) {
    }
  }

  export class GetProfileTimesheets {
    static readonly type = TIMESHEETS_ACTIONS.GET_PROFILE_TIMESHEETS;
  }

  export class ToggleProfileDialog {
    static readonly type = TIMESHEETS_ACTIONS.OPEN_PROFILE;

    constructor(public readonly action: DialogAction, public readonly id?: number) {}
  }

  export class OpenProfileTimesheetAddDialog {
    static readonly type = TIMESHEETS_ACTIONS.OPEN_PROFILE_TIMESHEET_ADD_DIALOG;
  }


  export class CloseProfileTimesheetAddDialog {
    static readonly type = TIMESHEETS_ACTIONS.CLOSE_PROFILE_TIMESHEET_ADD_DIALOG;
  }

  export class PostProfileTimesheet {
    static readonly type = TIMESHEETS_ACTIONS.POST_PROFILE_TIMESHEET;

    constructor(public readonly payload: any) {
    }
  }
}
