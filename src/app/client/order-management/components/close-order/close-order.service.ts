import { HttpClient } from '@angular/common/http';
import { CloseOrderPayload } from "@client/order-management/components/close-order/models/closeOrderPayload.model";
import { Observable } from "rxjs";
import { ClosePositionPayload } from "@client/order-management/components/close-order/models/closePositionPayload.model";
import { Injectable } from '@angular/core';
import { formatDate } from '@angular/common';
import { Order, OrderManagement, OrderManagementChild } from '@shared/models/order-management.model';

@Injectable()
export class CloseOrderService {
  public constructor(private http: HttpClient) {}

  public closeOrder(payload: CloseOrderPayload, isIrpOrder: boolean): Observable<void> {
    const path = isIrpOrder ? 'IRPOrders' : 'Order';
    return this.http.post<void>(`/api/${path}/close`, payload);
  }

  public closePosition(payload: ClosePositionPayload): Observable<void> {
    return this.http.post<void>(`/api/AppliedCandidates/closePosition`, payload);
  }

  public getPositionMaxDate(candidate: OrderManagementChild): string | null {
    if (candidate.actualEndDate) {
      return formatDate(candidate.actualEndDate, 'MM/dd/yyyy', 'en-US', 'UTC');
    }
    return null;
  }

  public getReorderMaxDate(order: Order | OrderManagement): string | null {
    if (order.jobStartDate) {
      return formatDate(order.jobStartDate, 'MM/dd/yyyy', 'en-US', 'UTC');
    }
    return null;
  }

  public getOrderMaxDate(order: Order | OrderManagement): string | null {
    if (order.jobEndDate) {
      return formatDate(order.jobEndDate, 'MM/dd/yyyy', 'en-US', 'UTC');
    }
    return null;
  }
}
