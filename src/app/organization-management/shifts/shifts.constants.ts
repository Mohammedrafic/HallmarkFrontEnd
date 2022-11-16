import { ExportColumn } from "@shared/models/export.model";

export const IrpShiftExportColumns: ExportColumn[] = [
  { text: 'Shift Name', column: 'Name' },
  { text: 'Start Time', column: 'StartTime' },
  { text: 'End Time', column: 'EndTime' },
  { text: 'On Call Shift ', column: 'OnCall' },
];
