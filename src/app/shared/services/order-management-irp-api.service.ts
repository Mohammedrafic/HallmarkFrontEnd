import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  IRPOrderManagementPage,
  OrderManagementFilter,
} from '@shared/models/order-management.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OrderManagementIrpApiService {
  constructor(private http: HttpClient) {}

  public getOrders(payload: OrderManagementFilter | object): Observable<IRPOrderManagementPage> {
    return this.http.post<IRPOrderManagementPage>(`/api/IRPOrders/filtered`, payload);
  }
}
