import { TIMESHEETS_ACTIONS } from '../model/timesheets.model';

export namespace Timesheets {
  export class GetAll {
    static readonly type = TIMESHEETS_ACTIONS.GET_TIMESHEETS;
  }
}
