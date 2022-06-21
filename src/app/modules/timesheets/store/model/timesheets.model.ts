import { PageOfCollections } from '@shared/models/page.model';
import { ITimesheet } from '../../interface/i-timesheet.interface';

export interface TimesheetsModel {
  timesheets: TimeSheetsPage | null;
}

export type TimeSheetsPage = PageOfCollections<ITimesheet>;

export interface TimesheetsModel {
  timesheets: ITimesheet[];
  profileTimesheets: ProfileTimeSheetDetail[];
  profileOpen: boolean;
}

export const DEFAULT_TIMESHEETS_STATE: TimesheetsModel = {
  timesheets: [],
  profileTimesheets: [],
  profileOpen: false,
}

export enum TIMESHEETS_ACTIONS {
  GET_TIMESHEETS = '[timesheets] GET TIMESHEETS',
  GET_PROFILE_TIMESHEETS = '[timesheets] GET PROFILE TIMESHEETS',
  OPEN_PROFILE = '[timesheets] OPEN PROFILE',
}

export interface ProfileTimeSheetDetail {
  day: string;
  timeIn: string;
  timeOut: string;
  costCenter: string;
  department: string;
  skill: string;
  jobId: string;
  category: string;
  hours: number;
}
