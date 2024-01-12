import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { OrderStatusSummaryReportRequest, OrderStatusSummaryCustomReport, OrderStatusSummaryReportFilters, Region, Department, Location } from "../store/model/order-status-summary-report.model";

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

  public getFiltersByOrganizationId(): Observable<OrderStatusSummaryReportFilters> {
    return this.http.get<OrderStatusSummaryReportFilters>(`/api/AnalyticsFilterOptions/orderstatussummary/filters`);
  }

  public getRegionsByOrganizationId(payload: { organizationId: number[] }): Observable<Region[]> {
    return this.http.post<Region[]>(`/api/AnalyticsFilterOptions/region/filter`, payload);
  }

  public getLocationsByRegionIds(body: { regionIds: string, organizationId: number[] }): Observable<Location[]> {
    return this.http.post<Location[]>(`/api/AnalyticsFilterOptions/location/filter`, body);
  }

  public getDepartmentsByLocationIds(body: { locationIds: string, organizationId: number[] }): Observable<Department[]> {
    return this.http.post<Department[]>(`/api/AnalyticsFilterOptions/department/filter`, body);
  }
}
