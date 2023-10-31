import { ExportColumn } from "@shared/models/export.model";

export const ShiftExportColumns: ExportColumn[] = [
  { text: 'Shift Name', column: 'Name' },
  { text: 'Start Time', column: 'StartTime' },
  { text: 'End Time', column: 'EndTime' },
  { text: 'On Call Shift ', column: 'OnCallText' },
  { text: 'InactiveDate ', column: 'InactiveDate' },
];
export const InactivateColFormat = {
  type:'date', format: 'MM/dd/yyyy',
};
