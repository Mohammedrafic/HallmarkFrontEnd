import { FinancialTimeSheetFilter } from "@admin/analytics/models/financial-timesheet.model";
import { DepartmentsByLocationsFilter } from "@shared/models/department.model";
import { LocationsByRegionsFilter } from "@shared/models/location.model";
import { regionFilter } from "@shared/models/region.model";

export class GetRegionsByOrganizations {
  static readonly type = '[LogiReport] Get The List Of Regions By Organizations';
  constructor(public filter?: regionFilter) { }
}
export class GetLocationsByRegions {
  static readonly type = '[LogiReport] Get The List Of Locations By Regions';
  constructor(public filter?: LocationsByRegionsFilter) { }
}
export class GetDepartmentsByLocations {
  static readonly type = '[LogiReport] Get The List Of Departments By Locations';
  constructor(public filter?: DepartmentsByLocationsFilter) { }
}
export class GetLogiReportData {static readonly type = '[LogiReport] Get Logi Report Data';
constructor() { }
}
export class ClearLogiReportState {
  static readonly type = '[alerts] Clear Logi Report State';
  constructor(){}
}
export class GetFinancialTimeSheetReportFilterOptions{
  static readonly type = '[LogiReport] Get Financial TimeSheet Report Filter Options';
  constructor(public filter: FinancialTimeSheetFilter) { }
}