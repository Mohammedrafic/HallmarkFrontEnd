import { ExportColumn } from '@shared/models/export.model';
import { ExportOption } from '../interface';
import { ExportType } from '../enums';

export const exportOptions: ExportOption[] = [
  {text: ExportType.Excel_file, id: '0', ext: 'xlsx'},
  {text: ExportType.CSV_file, id: '1', ext: 'csv'},
  {text: ExportType.Custom, id: '2', ext: null},
];

export const TimesheetDetailsExportOptions: ExportColumn[] = [
  { text:'First Name', column: 'firstName'},
  { text:'Last Name', column: 'lastName'},
  { text:'Job Title', column: 'jobTitle'},
  { text:'Location', column: 'location'},
  { text:'Department', column: 'department'},
  { text:'Skill', column: 'skill'},
  { text:'Start Date', column: 'startDate'},
  { text:'End Date', column: 'endDate'},
]