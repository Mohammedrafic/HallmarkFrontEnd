import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CloseOrderPayload } from "@client/order-management/components/close-order/models/closeOrderPayload.model";
import { Observable } from "rxjs";
import { ClosePositionPayload } from "@client/order-management/components/close-order/models/closePositionPayload.model";

@Injectable({
  providedIn: 'root',
})
export class CloseOrderService {
  public constructor(private http: HttpClient) {}

  public closeOrder(payload: CloseOrderPayload, isIrpOrder: boolean): Observable<void> {
    const path = isIrpOrder ? 'IRPOrders' : 'Order';
    return this.http.post<void>(`/api/${path}/close`, payload);
  }

  public closePosition(payload: ClosePositionPayload): Observable<void> {
    return this.http.post<void>(`/api/AppliedCandidates/closePosition`, payload);
  }
}
