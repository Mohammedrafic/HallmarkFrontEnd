import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { Observable } from 'rxjs';

import { ReOrderPage } from "../interfaces";

@Injectable()
export class ReOrderApiService {
  constructor(private readonly http: HttpClient) { }

  public getReOrdersByOrderIdByOrderId(
    orderId: number,
    pageNumber: number,
    pageSize: number,
    organizationId?: number,
  ): Observable<ReOrderPage> {
    return this.http.post<ReOrderPage>(
      '/api/Orders/reorders/organization', { orderId, pageNumber, pageSize, organizationId }
    );
  }
}