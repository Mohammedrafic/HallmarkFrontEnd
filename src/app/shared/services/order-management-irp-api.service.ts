import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import {
  IRPOrderManagementPage,
  IRPOrderPositionMain,
  OrderManagementFilter,
} from '@shared/models/order-management.model';

@Injectable()
export class OrderManagementIrpApiService {
  constructor(private http: HttpClient) {}

  public getOrders(payload: OrderManagementFilter | object): Observable<IRPOrderManagementPage> {
    return this.http.post<IRPOrderManagementPage>(`/api/IRPOrders/filtered`, payload);
  }

  public getOrderPositions(orderIds: number[]): Observable<IRPOrderPositionMain[]> {
    return this.http.post<IRPOrderPositionMain[]>(`/api/IRPOrders/positions`, { orderIds });
  }
}
