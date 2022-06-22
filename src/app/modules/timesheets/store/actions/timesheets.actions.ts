import { TIMESHEETS_ACTIONS } from '../../enums/timesheets.enum';
import { ITimesheetsFilter } from '../../interface/i-timesheet.interface';
import { ProfileTimeSheetActionType } from '../../enums/timesheets.enum';
import { ProfileTimeSheetDetail, TIMESHEETS_ACTIONS } from '../model/timesheets.model';

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
  }

  export class OpenProfileTimesheetEditDialog {
    static readonly type = TIMESHEETS_ACTIONS.OPEN_PROFILE_TIMESHEET_EDIT_DIALOG;

    constructor(public dialogType: ProfileTimeSheetActionType, public timesheet: ProfileTimeSheetDetail) {}
  }

  export class OpenProfileTimesheetAddDialog {
    static readonly type = TIMESHEETS_ACTIONS.OPEN_PROFILE_TIMESHEET_EDIT_DIALOG;

    constructor(public dialogType: ProfileTimeSheetActionType) {}
  }


  export class CloseProfileTimesheetEditDialog {
    static readonly type = TIMESHEETS_ACTIONS.CLOSE_PROFILE_TIMESHEET_EDIT_DIALOG;
  }
}
