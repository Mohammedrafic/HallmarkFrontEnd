import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { Observable } from 'rxjs';

import { ReOrderPage } from "../interfaces";

@Injectable()
export class ReOrderApiService {
  constructor(private readonly http: HttpClient) { }

  public getReOrdersByOrderId(
    orderId: number,
    pageNumber: number,
    pageSize: number,
    organizationId?: number,
  ): Observable<ReOrderPage> {
    const businessUnitType = organizationId ? 'agency' : 'organization';
  
    return this.http.post<ReOrderPage>(
      `/api/Orders/reorders/${businessUnitType}`, { orderId, pageNumber, pageSize, organizationId }
    );
  }
}