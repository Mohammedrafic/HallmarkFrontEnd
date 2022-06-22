import { PageOfCollections } from '@shared/models/page.model';
import { ITimesheet } from '../../interface/i-timesheet.interface';

export interface TimesheetsModel {
  timesheets: TimeSheetsPage | null;
}

export type TimeSheetsPage = PageOfCollections<ITimesheet>;
import { ProfileTimeSheetActionType } from "../../enums/timesheets.enum";

export interface TimesheetsModel {
  timesheets: ITimesheet[];
  profileTimesheets: ProfileTimeSheetDetail[];
  profileOpen: boolean;
  selectedTimeSheet: ProfileTimeSheetDetail | null;
  timeSheetDialogOpen: boolean;
  editDialogType: ProfileTimeSheetActionType | null;
  profileDialogTimesheet: ProfileTimeSheetDetail | null;
}

export const DEFAULT_TIMESHEETS_STATE: TimesheetsModel = {
  timesheets: [],
  profileTimesheets: [],
  profileOpen: false,
  timeSheetDialogOpen: false,
  selectedTimeSheet: null,
  editDialogType: ProfileTimeSheetActionType.Add,
  profileDialogTimesheet: null,
}

export enum TIMESHEETS_ACTIONS {
  GET_TIMESHEETS = '[timesheets] GET TIMESHEETS',
  GET_PROFILE_TIMESHEETS = '[timesheets] GET PROFILE TIMESHEETS',
  OPEN_PROFILE = '[timesheets] OPEN PROFILE',
  OPEN_PROFILE_TIMESHEET_EDIT_DIALOG = '[timesheets] OPEN PROFILE TIMESHEET EDIT DIALOG',
  OPEN_PROFILE_TIMESHEET_ADD_DIALOG = '[timesheets] OPEN PROFILE TIMESHEETS ADD DIALOG',
  CLOSE_PROFILE_TIMESHEET_EDIT_DIALOG = '[timesheets] CLOSE PROFILE TIMESHEET EDIT DIALOG',
}

export interface ProfileTimeSheetDetail {
  id?: number;
  day: string;
  timeIn: string;
  timeOut: string;
  costCenter: string;
  category: string;
  hours: number;
  rate: number;
  total: number;
}
