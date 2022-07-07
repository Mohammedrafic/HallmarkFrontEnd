import { ItemModel } from '@syncfusion/ej2-splitbuttons/src/common/common-model';

import { ExportType, HourOccupationType, TIMETHEETS_STATUSES } from '../enums';
import { TabConfig, TabCountConfig, Timesheet } from '../interface';


export const TAB_ADMIN_TIMESHEETS: TabConfig[] = [
  {
    title: 'All Timesheets',
  },
  {
    title: 'Pending Approval',
    amount: 2,
  },
  {
    title: 'Missing',
    amount: 6,
  },
  {
    title: 'Rejected',
    amount: 5,
  }
];

export const exportOptions: ItemModel[] = [
  { text: ExportType.Excel_file, id: '0' },
  { text: ExportType.CSV_file, id: '1' },
  { text: ExportType.Custom, id: '2' }
];

export const MokTabsCounts: TabCountConfig = {
  pending: 1,
  missing: 4,
  rejected: 7,
};

export const MokTimesheet: Timesheet = {
  id: 1,
  name: 'Brooklyn Simm',
  firstName: 'Brooklyn',
  lastName: 'Simm',
  statusText: TIMETHEETS_STATUSES.PENDING_APPROVE,
  orderId: '22-30-01',
  skill: 'Certified Nursed Assistant',
  location: 'Certified Nursed Assistant',
  startDate: '2022-07-06T16:00:00',
  department: 'Emergency Department',
  agencyName: 'AB Staffing',
  orgName: 'AB Staffing',
  billRate: 10,
  totalDays: 32,
  status: TIMETHEETS_STATUSES.PENDING_APPROVE,
  workWeek: '4 - WE 02/20/2022',
};

export const profileDetailsHoursChartColors = [
  '#FFFFFF',
  '#D8E5FF',
  '#B2CCFF',
  '#9EBFFF',
  '#6499FF',
  '#518CFF',
  '#3E7FFF',
];

export const profileDetailsHoursChartColorsMap: Record<HourOccupationType, string> = {
  [HourOccupationType.OnCall]: '#3E7FFF',
  [HourOccupationType.Callback]: '#518CFF',
  [HourOccupationType.Regular]: '#6499FF',
  [HourOccupationType.Holiday]: '#9EBFFF',
  [HourOccupationType.Charge]: '#B2CCFF',
  [HourOccupationType.Preceptor]: '#D8E5FF',
  [HourOccupationType.Orientation]: '#FFFFFF',
};
