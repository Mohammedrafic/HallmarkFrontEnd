import { TIMESHEETS_ACTIONS } from '../../enums/timesheets.enum';
import { ITimesheetsFilter } from '../../interface/i-timesheet.interface';

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
}
