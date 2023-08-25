import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { OrderStatusSummaryReportRequest, OrderStatusSummaryCustomReport, OrderStatusSummaryReportFilters } from "../store/model/order-status-summary-report.model";
import { sortByField } from "../../../shared/helpers/sort-by-field.helper";
import { CandidatesDetailsRegions } from "../../../shared/components/candidate-details/models/candidate.model";

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
    return this.http.get<OrderStatusSummaryReportFilters>(`/api/AnalyticsFilterOptions/orderstatussummary`);
  }
}
