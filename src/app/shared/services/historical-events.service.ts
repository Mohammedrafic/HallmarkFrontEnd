import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import { OrderHistoricalEvent } from '@shared/models';

@Injectable({
  providedIn: 'root',
})
export class HistoricalEventsService {
  constructor(private http: HttpClient) {}

  public getEvents(
    orderId: number,
    organizationId?: number | null,
    positionId?: number
  ): Observable<OrderHistoricalEvent[]> {
    if (organizationId) {
      const params = positionId ? 
        new HttpParams().append('organizationId', organizationId).append('positionId', positionId) :
        new HttpParams().append('organizationId', organizationId);
      return this.http
        .get<OrderHistoricalEvent[]>(`/api/historicaldata/order/${orderId}`, { params: params })
        .pipe(catchError(() => of([])));
    } else {
      return this.http
        .get<OrderHistoricalEvent[]>(
          `/api/historicaldata/order/${orderId}`,
          positionId ? { params: { positionId } } : {}
        )
        .pipe(catchError(() => of([])));
    }
  }
}
