import { PageOfCollections } from '@shared/models/page.model';
import { ITimesheet } from '../../interface/i-timesheet.interface';
import { ProfileTimeSheetActionType } from "../../enums/timesheets.enum";

export type TimeSheetsPage = PageOfCollections<ITimesheet>;

export interface TimesheetsModel {
  timesheets: TimeSheetsPage | null;
  profileTimesheets: ProfileTimeSheetDetail[];
  profileOpen: boolean;
  selectedTimeSheet: ProfileTimeSheetDetail | null;
  timeSheetDialogOpen: boolean;
  editDialogType: ProfileTimeSheetActionType | null;
  profileDialogTimesheet: ProfileTimeSheetDetail | null;
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
