import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

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
}
