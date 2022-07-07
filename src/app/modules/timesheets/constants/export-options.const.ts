import { ExportOption } from '../interface/export-option.interface';
import { ExportType } from '../enums';

export const exportOptions: ExportOption[] = [
  {text: ExportType.Excel_file, id: '0', ext: 'xlsx'},
  {text: ExportType.CSV_file, id: '1', ext: 'csv'},
  {text: ExportType.Custom, id: '2', ext: null},
];
