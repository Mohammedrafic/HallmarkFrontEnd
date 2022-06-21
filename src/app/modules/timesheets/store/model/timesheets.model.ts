import { PageOfCollections } from '@shared/models/page.model';
import { ITimesheet } from '../../interface/i-timesheet.interface';

export interface TimesheetsModel {
  timesheets: TimeSheetsPage | null;
}

export type TimeSheetsPage = PageOfCollections<ITimesheet>;
