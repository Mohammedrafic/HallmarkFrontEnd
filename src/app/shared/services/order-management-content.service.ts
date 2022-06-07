import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { OrderManagementPage } from '@shared/models/order-management.model';

@Injectable({ providedIn: 'root' })
export class OrderManagementContentService {
  constructor(private http: HttpClient) { }

  /**
   * Get the incomplete order
   @param order incomplete order
   */
  public getIncompleteOrders(order: any): Observable<void> {
    return this.http.post<void>(`/api/Orders/Incomplete`, order);
  }

  /**
   * Get the orders
   @param orderBy
   @param pageNumber
   @param pageSize
   */
  public getOrders(orderBy: string, pageNumber: number, pageSize: number): Observable<OrderManagementPage> {
    return this.http.get<OrderManagementPage>(`/api/Orders`, { params: { OrderBy: orderBy, PageNumber: pageNumber, PageSize: pageSize }});
  }
}
