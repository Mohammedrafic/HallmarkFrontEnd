import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { OrderStatusSummaryReportRequest, OrderStatusSummaryCustomReport, OrderStatusSummaryReportFilters, Region, Department, Location, OrderTypeDto, Skills } from "../store/model/order-status-summary-report.model";
import { sortByField } from "../../../shared/helpers/sort-by-field.helper";

@Injectable({
  providedIn: 'root'
})
export class OrderStatusSummaryReportService {

  constructor(private http: HttpClient) { }

  public getOrderStatusSummaryReport(
    payload: OrderStatusSummaryReportRequest
  ): Observable<OrderStatusSummaryCustomReport[]> {
    return this.http.post<OrderStatusSummaryCustomReport[]>(`/api/Reports/orderstatussummary`, payload);
  }

  public getFiltersByOrganizationId(): Observable<OrderTypeDto[]> {
    return this.http.get<OrderTypeDto[]>(`/api/AnalyticsFilterOptions/orderstatussummary/filters`);
  }

  public getRegionsByOrganizationId(organizationId: number[]): Observable<Region[]> {
    return this.http.post<Region[]>(`/api/AnalyticsFilterOptions/region/filter`, organizationId).pipe(map((data) => sortByField(data, 'region')));
  }

  public getLocationsByRegionIds( regionIds: string, organizationId: number[] ): Observable<Location[]> {
    const body = { regionIds, organizationId };
    return this.http.post<Location[]>(`/api/AnalyticsFilterOptions/location/filter`, body).pipe(map((data) => sortByField(data, 'location')));
  }

  public getDepartmentsByLocationIds( locationIds: string, organizationId: number[] ): Observable<Department[]> {
    const body = { locationIds, organizationId };
    return this.http.post<Department[]>(`/api/AnalyticsFilterOptions/department/filter`, body).pipe(map((data) => sortByField(data, 'department')));
  }

  public getSkillsByOrganizationId(): Observable<Skills[]> {
    return this.http.get<Region[]>(`/api/AnalyticsFilterOptions/skills/filter`).pipe(map((data) => sortByField(data, 'skill')));
  }
}
