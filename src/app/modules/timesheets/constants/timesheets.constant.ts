import { ItemModel } from '@syncfusion/ej2-splitbuttons/src/common/common-model';

import { ExportType } from '../enums/timesheets.enum';
import { TabConfig } from './../interface/common.interface';
import { HourOccupationType } from '../enums/hour-occupation-type.enum';


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
