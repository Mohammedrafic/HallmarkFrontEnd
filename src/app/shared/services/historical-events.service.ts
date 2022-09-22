import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import { OrderHistoricalEvent } from '@shared/models';

@Injectable({
  providedIn: 'root',
})
export class HistoricalEventsService {
  constructor(private http: HttpClient) {}

  public getEvents(orderId: number, organizationId?: number | null): Observable<OrderHistoricalEvent[]> {
    if (organizationId) {
      return this.http
        .get<OrderHistoricalEvent[]>(`/api/historicaldata/order/${orderId}`, {
          params: { organizationId },
        })
        .pipe(catchError(() => of([])));
    } else {
      return this.http
        .get<OrderHistoricalEvent[]>(`/api/historicaldata/order/${orderId}`)
        .pipe(catchError(() => of([])));
    }
  }
}
