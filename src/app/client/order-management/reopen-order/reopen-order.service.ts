import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ReopenOrderPayload,
  ReopenPositionPayload,
} from '@client/order-management/reopen-order/models/reopen-order.model';

@Injectable()
export class ReOpenOrderService {
  public constructor(private http: HttpClient) {}

  public reOpenOrder(payload: ReopenOrderPayload): Observable<void> {
    return this.http.post<void>(`/api/order/reopen`, payload);
  }

  public reOpenPosition(payload: ReopenPositionPayload): Observable<void> {
    return this.http.post<void>(`/api/appliedCandidates/reopenPosition`, payload);
  }
}
