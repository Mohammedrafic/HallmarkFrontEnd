import { ItemModel } from '@syncfusion/ej2-splitbuttons/src/common/common-model';

import { ExportType, TIMETHEETS_STATUSES } from '../enums';
import { TabConfig } from '../interface';


export const TAB_ADMIN_TIMESHEETS: TabConfig[] = [
  {
    title: 'All Timesheets',
    value: [],
  },
  {
    title: 'Pending Approval',
    value: [2, 3],
  },
  {
    title: 'Missing',
    value: [4],
  },
  {
    title: 'Rejected',
    value: [5],
  },
];

export const MapTimesheetsStatuses: Map<TIMETHEETS_STATUSES, number> = new Map()
  .set(TIMETHEETS_STATUSES.INCOMPLETE, 1)
  .set(TIMETHEETS_STATUSES.PENDING_APPROVE, 2)
  .set(TIMETHEETS_STATUSES.PENDING_APPROVE_ASTERIX, 3)
  .set(TIMETHEETS_STATUSES.MISSING, 4)
  .set(TIMETHEETS_STATUSES.REJECTED, 5)
  .set(TIMETHEETS_STATUSES.APPROVED, 6);

export const TimesheetExportOptions: ItemModel[] = [
  { text: ExportType.Excel_file, id: '0' },
  { text: ExportType.CSV_file, id: '1' },
  { text: ExportType.Custom, id: '2' },
];

export const UNIT_ORGANIZATIONS_FIELDS = {
  text: 'name',
  value: 'id',
};

export const ColorsWidgetMap: string[] = [
  '#79B392', '#E48192', '#9B85C6', '#8CB3FF', '#8190B2', '#E0BD82', '#518CFF', '#D1D6E2',
  '#70B16E', '#FFBBBB', '#6499FF', '#677089', '#D1EACE', '#C2A7F9', '#FCC769',
];
