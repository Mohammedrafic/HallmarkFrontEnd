import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CloseOrderPayload } from "@client/order-management/close-order/models/closeOrderPayload.model";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class CloseOrderService {
  public constructor(private http: HttpClient) {}

  public closeOrder(payload: CloseOrderPayload): Observable<void> {
    return this.http.post<void>(`/api/Order/close`, payload);
  }

  public closePosition(payload: CloseOrderPayload): Observable<void> {
    return this.http.post<void>(`/api/Position/close`, payload);
  }

}
