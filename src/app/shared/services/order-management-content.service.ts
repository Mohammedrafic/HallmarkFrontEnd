import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import {
  OrderManagementFilter,
  OrderManagementPage,
  AgencyOrderManagementPage,
  OrderCandidatesListPage
} from '@shared/models/order-management.model';
import { Order } from '@shared/models/organization.model';

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

  /**
   * Get the agency order candidates
   @param orderId
   @param organizationId
   @param pageNumber
   @param pageSize
   */
  public getAgencyOrderCandidatesList(orderId: number, organizationId: number, pageNumber: number, pageSize: number ): Observable<OrderCandidatesListPage> {
    return this.http.get<OrderCandidatesListPage>(`/api/CandidateProfile/order/${orderId}/organization/${organizationId}`, { params: { PageNumber: pageNumber, PageSize: pageSize }});
  }

  /**
   * Get the agency orders information
   @param id
   @param organizationId
   */
  public getAgencyOrderGeneralInformation(id: number, organizationId: number ): Observable<Order> {
    return this.http.get<Order>(`/api/Orders/${id}/organization/${organizationId}`);
  }

  /**
   * Get order by id
   @param id
   */
  public getAgencyOrderById(id: number, organizationId: number): Observable<Order> {
    return this.http.get<Order>(`/api/Orders/${id}/organization/${organizationId}`);
  }
}
