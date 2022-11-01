import {  FinancialTimeSheetReportFilterOptions} from "@admin/analytics/models/financial-timesheet.model";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ConfigurationDto } from "@shared/models/analytics.model";
import { DepartmentsPage } from "@shared/models/department.model";
import { LocationsPage } from "@shared/models/location.model";
import { regionsPage } from "@shared/models/region.model";
import { Observable } from "rxjs";

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
   * Get the Financial Timesheet  Filter Options
   * @return FinancialTimeSheetReportFilterOptions
   */
public getFinancialTimeSheetReportFilterOptions(filter:any): Observable<FinancialTimeSheetReportFilterOptions> {
  return this.http.post<FinancialTimeSheetReportFilterOptions>(`/api/LogiReport/financialtimesheet/filter`,filter);
}
}