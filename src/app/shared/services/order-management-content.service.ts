import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { OrderManagementFilter, OrderManagementPage, AgencyOrderManagementPage } from '@shared/models/order-management.model';

@Injectable({ providedIn: 'root' })
export class OrderManagementContentService {
  constructor(private http: HttpClient) { }

  /**
   * Get the incomplete order
   @param payload filter with details we need to get
   */
  public getIncompleteOrders(payload: OrderManagementFilter | object): Observable<OrderManagementPage> {
    return this.http.post<OrderManagementPage>(`/api/Orders/Incomplete`, payload);
  }

  /**
   * Get the orders
   @param payload filter with details we need to get
   */
  public getOrders(payload: OrderManagementFilter | object): Observable<OrderManagementPage> {
    return this.http.post<OrderManagementPage>(`/api/Orders/all`, payload);
  }

  /**
   * Get the agency orders
   @param pageNumber
   @param pageSize
   */
  public getAgencyOrders(pageNumber: number, pageSize: number /** TODO: Add filter params */): Observable<AgencyOrderManagementPage> {
    return this.http.get<AgencyOrderManagementPage>(`/api/Orders/agencyOrders`, { params: { PageNumber: pageNumber, PageSize: pageSize }});
  }
}
