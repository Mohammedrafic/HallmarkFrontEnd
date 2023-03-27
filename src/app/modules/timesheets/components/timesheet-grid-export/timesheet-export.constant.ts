import { formatDate } from "@angular/common";
import { ExportColumn } from "@shared/models/export.model";
import { TAB_ADMIN_TIMESHEETS } from "../../constants/timesheets.constant";

export const GetExportFileName = (tabIndex: number): string => {
    const tabLists = TAB_ADMIN_TIMESHEETS;
    return `${tabLists[tabIndex].title} ${formatDate(Date.now(), 'MM/dd/yyyy hh:mm a', 'en-US')}`;
  };
  export const OrganizationTabsToExport: number[] = [
    
  ];

  export const TimesheetsExportCols: ExportColumn[] = [
    { text:'Name', column: 'fullName'},
    { text:'Timesheet Status', column: 'status'},
    { text:'Miles Status', column: 'mileageStatus'},
    { text:'Job Id', column: 'formattedId'},
    { text:'Skill', column: 'skill'},
    { text:'Location', column: 'location'},
    { text:'Work Week', column: 'workWeek'},
    { text:'Department', column: 'department'},
    { text:'Bill Rate($)', column: 'billRate'},   
    { text:'Agency Name', column: 'agencyName'},
    { text:'Total Days', column: 'totalDays'}
  ]