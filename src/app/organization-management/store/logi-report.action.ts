import { CommonReportFilter, CommonCandidateSearchFilter, CommonCredentialSearchFilter } from "@admin/analytics/models/common-report.model";
import { DepartmentsByLocationsFilter } from "@shared/models/department.model";
import { LocationsByRegionsFilter } from "@shared/models/location.model";
import { regionFilter } from "@shared/models/region.model";
import { JobDetailSummaryFilter } from "../../admin/analytics/models/jobdetail-summary.model";

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
export class GetCommonReportFilterOptions{
  static readonly type = '[LogiReport] Get Common Report Filter Options';
  constructor(public filter: CommonReportFilter) { }
}
export class GetCommonReportCandidateSearch{
  static readonly type = '[LogiReport] Get Common Candidate Search';
  constructor(public filter: CommonCandidateSearchFilter) { }
}
export class GetJobDetailSummaryReportFilterOptions {
  static readonly type = '[LogiReport] Get Job Detail Summary Report Filter Options';
  constructor(public filter: JobDetailSummaryFilter) { }
}
export class GetCommonReportCredentialSearch{
  static readonly type = '[LogiReport] Get Common Credential Search';
  constructor(public filter: CommonCredentialSearchFilter) { }
}

export class GetCommonReportCandidateStatusOptions {
  static readonly type = '[LogiReport] Get Common Candidate Status';
  constructor(public filter: CommonReportFilter) { }
}

