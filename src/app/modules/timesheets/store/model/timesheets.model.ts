import { PageOfCollections } from '@shared/models/page.model';
import { Invoice, ITimesheet, ProfileUploadedFile } from '../../interface';
import { ProfileTimeSheetActionType } from '../../enums';

export type TimeSheetsPage = PageOfCollections<ITimesheet>;

export interface TimesheetsModel {
  timesheets: TimeSheetsPage | null;
  profileTimesheets: ProfileTimeSheetDetail[];
  profileOpen: boolean;
  selectedTimeSheetId: number | null;
  timeSheetDialogOpen: boolean;
  editDialogType: ProfileTimeSheetActionType | null;
  profileDialogTimesheet: ProfileTimeSheetDetail | null;
  timesheetDetails: TimesheetDetails;
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

export interface TimesheetDetails {
  uploads: ProfileUploadedFile[];
  invoices: Invoice[];
}
