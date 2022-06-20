export interface TimesheetsModel {
  timesheets: ITimesheet[];
}

export const DEFAULT_TIMESHEETS_STATE: TimesheetsModel = {
  timesheets: [],
}

export enum TIMESHEETS_ACTIONS {
  GET_TIMESHEETS = '[timesheets] GET TIMESHEETS'
}

export interface ITimesheet {
  name: string;
}
