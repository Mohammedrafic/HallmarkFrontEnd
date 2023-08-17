import {
  CandidateStatusAndReasonFilterOptionsDto,
  CommonReportFilterOptions,
  SearchCandidate,
  SearchCredential,
  StaffScheduleReportFilterOptions,
} from "@admin/analytics/models/common-report.model";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { sortByField } from "@shared/helpers/sort-by-field.helper";
import { ConfigurationDto } from "@shared/models/analytics.model";
import { CredentialType } from "@shared/models/credential-type.model";
import { DepartmentsPage } from "@shared/models/department.model";
import { LocationsPage } from "@shared/models/location.model";
import { regionsPage } from "@shared/models/region.model";
import { map, Observable } from "rxjs";
import { AgencyCommonFilterReportOptions } from "../../agency/agency-reports/models/agency-common-report.model";
import { DataSourceItem } from "../../core/interface/common.interface";
import { OrganizationStructure } from "../models/organization.model";

@Injectable({ providedIn: 'root' })
export class LogiReportService {

  constructor(private http: HttpClient) { }

  /**
   * Get the list of available Regions by organizations
   * @return Array of Regions
   */
   public getRegionsByOrganizationId(filter:any): Observable<regionsPage> {
      return this.http.post<regionsPage>(`/api/LogiReport/region/filter`, filter);
  }

  /**
   * Get the list of available Locations by Regions
   * @return Array of Locations
   */
   public getLocationsByOrganizationId(filter:any): Observable<LocationsPage> {
    return this.http.post<LocationsPage>(`/api/LogiReport/location/filter`, filter);
}

/**
   * Get the list of available Departments by Locations
   * @return Array of Departments
   */
 public getDepartmentsByOrganizationId(filter:any): Observable<DepartmentsPage> {
  return this.http.post<DepartmentsPage>(`/api/LogiReport/department/filter`, filter);
}
/**
   * Get the list of Configurations
   * @return ConfigurationDto
   */
public getLogiReportData(): Observable<ConfigurationDto[]> {
  return this.http.get<ConfigurationDto[]>(`/config/ReportServer`);
}
/**
   * Get the Common Report  Filter Options
   * @return CommonReportFilterOptions
   */
public getCommonReportFilterOptions(filter:any): Observable<CommonReportFilterOptions> {
  return this.http.post<CommonReportFilterOptions>(`/api/LogiReport/financialtimesheet/filter`,filter).pipe(map((data) => {
    const sortedFields: Record<keyof CommonReportFilterOptions, string> = { 
      candidateStatuses: 'statusText',
      orderStatuses: 'statusText',
      jobStatuses:'statusText',
      masterSkills: 'name',
      skillCategories: 'name',
      agencies: 'agencyName',
      timesheetStatuses: 'name',
      candidateStatusesAndReasons :'statusText',
      jobStatusesAndReasons :'statusText',
      allCandidateStatusesAndReasons :'statusText',
      allJobStatusesAndReasons :'statusText',
      invoiceStatuses:'name'
    }
    
    return Object.fromEntries(Object.entries(data).map(([key, value]) => [[key], sortByField(value, sortedFields[key as keyof CommonReportFilterOptions])]))
  }));
}
/**
   * Get the Common Candidate Search
   * @return SearchCandidate
   */
 public getCommonCandidateSearch(filter:any): Observable<SearchCandidate[]> {
   return this.http.post<SearchCandidate[]>(`/api/LogiReport/financialtimesheet/candidatesearch`,filter);
  }
  /**
   * Get the Common Candidate Search For Agency
   * @return SearchCandidateAgency
   */
  public getCommonAgencyCandidateSearch(filter: any): Observable<SearchCandidate[]> {
    return this.http.post<SearchCandidate[]>(`/api/LogiReport/common/candidatesearch`, filter);
  }
/**
   * Get the Common Credential Search
   * @return SearchCredential
   */
 public getCommonCredentialSearch(filter:any): Observable<SearchCredential[]> {
  return this.http.post<SearchCredential[]>(`/api/LogiReport/common/credentialsearch`,filter);
  }


  public getCommonReportCandidateStatusOptions(filter: any): Observable<CandidateStatusAndReasonFilterOptionsDto[]> {
    return this.http.post<CandidateStatusAndReasonFilterOptionsDto[]>(`/api/LogiReport/common/candidatestatus`, filter).pipe(map((data) => {
      return data;
    }));
  }

  public getStaffScheduleReportOptions(filter: any): Observable<StaffScheduleReportFilterOptions> {
    return this.http.post<StaffScheduleReportFilterOptions>(`/api/LogiReport/staffschedulebyshift/filter`, filter).pipe(map((data) => {
      return data;
    }));
  }
  /**
   * Get the Staff list Candidate Search
   * @return SearchCandidate
   */
 public getStaffListCandidateSearch(filter:any): Observable<SearchCandidate[]> {
  return this.http.post<SearchCandidate[]>(`/api/LogiReport/stafflist/candidatesearch`,filter);
  }
  /**
  * TODO: remove this with shared service
  */
  public getOrganizations(): Observable<DataSourceItem[]> {
    return this.http.get<DataSourceItem[]>(`/api/Agency/partneredorganizations`);
  }

  /**
   * Get regions-locations-departments for selected organizations
   */
  public getOrganizationsStructure(organizationIds: number[]): Observable<OrganizationStructure[]> {
    return this.http.get<OrganizationStructure[]>(`/api/Organizations/structure/partnered`, { params: { organizationIds } });
  }
  /**
   * Get the Common Report  Filter Options
   * @return CommonReportFilterOptions
   */
  public getAgencyCommonReportFilterOptions(filter: any): Observable<AgencyCommonFilterReportOptions> {
    return this.http.post<AgencyCommonFilterReportOptions>(`/api/LogiReport/agencycommonreport/filter`, filter).pipe(map((data) => {
      const sortedFields: Record<keyof AgencyCommonFilterReportOptions, string> = {
        candidateStatuses: 'statusText',
        orderStatuses: 'statusText',
        jobStatuses: 'statusText',
        masterSkills: 'name',
        skillCategories: 'name',
        timesheetStatuses: 'name',
        candidateStatusesAndReasons: 'statusText',
        jobStatusesAndReasons: 'statusText',
        allCandidateStatusesAndReasons: 'statusText',
        allJobStatusesAndReasons: 'statusText',
        invoiceStatuses: 'name'
      }

      return Object.fromEntries(Object.entries(data).map(([key, value]) => [[key], sortByField(value, sortedFields[key as keyof AgencyCommonFilterReportOptions])]))
    }));
  }

  public getCredentialTypes(): Observable<CredentialType[]> {
    return this.http.get<CredentialType[]>(`/api/CredentialTypes/all`);
  }
}
