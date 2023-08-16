import { ScheduleFilters } from './../../modules/schedule/interface/schedule.interface';
import { CommonReportFilter, CommonCandidateSearchFilter, CommonCredentialSearchFilter } from "@admin/analytics/models/common-report.model";
import { DepartmentsByLocationsFilter } from "@shared/models/department.model";
import { LocationsByRegionsFilter } from "@shared/models/location.model";
import { regionFilter } from "@shared/models/region.model";
import { JobDetailSummaryFilter } from "../../admin/analytics/models/jobdetail-summary.model";
import { AgencyCommonReportFilter, CommonAgencyCandidateSearchFilter } from '../../agency/agency-reports/models/agency-common-report.model';

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
export class GetCommonReportAgencyCandidateSearch {
  static readonly type = '[LogiReport] Get Common Agency Candidate Search';
  constructor(public filter: CommonAgencyCandidateSearchFilter) { }
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

export class GetStaffScheduleReportFilterOptions{
  static readonly type = '[LogiReport] Get Staff Schedule Report Filter Options';
  constructor(public filter: CommonReportFilter) { }
}

export class GetCandidateSearchFromScheduling {
  static readonly type = '[LogiReport] Get Candidate Search from scheduling';
  constructor(public filter: ScheduleFilters) { }
}

export class GetStaffListReportCandidateSearch{
  static readonly type = '[LogiReport] Get Staff List Candidate Search';
  constructor(public filter: CommonCandidateSearchFilter) { }
}
export class GetOrganizationsByAgency {
  static readonly type = '[LogiReport] Get Organizations By Agency';
  constructor() { }
}
export class GetOrganizationsStructureByOrgIds {
  static readonly type = '[LogiReport] Get Organizations Structure By OrgIds';
  constructor(public organizationIds:number[]) { }

}
export class GetAgencyCommonFilterReportOptions {
  static readonly type = '[LogiReport] Get Agency Common Report Filter Options';
  constructor(public filter: AgencyCommonReportFilter) { }
}
export class GetCredentialTypes {
  static readonly type = '[candidate] Get Credential Types';
}


