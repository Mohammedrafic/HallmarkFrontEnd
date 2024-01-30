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
    positionId?: number,
    isIrpFlag?:any,
  ): Observable<OrderHistoricalEvent[]> {
    if (organizationId) {
      const params = positionId ? 
        new HttpParams().append('organizationId', organizationId).append('positionId', positionId).append('irpFlag', isIrpFlag) :
        new HttpParams().append('organizationId', organizationId).append('irpFlag', isIrpFlag);
      return this.http
        .get<OrderHistoricalEvent[]>(`/api/historicaldata/order/${orderId}`, { params: params })
        .pipe(catchError(() => of([])));
    } else {
      return this.http
        .get<OrderHistoricalEvent[]>(
          `/api/historicaldata/order/${orderId}`,
          positionId ? { params: { positionId, isIrpFlag } } : { params: { isIrpFlag }}
        )
        .pipe(catchError(() => of([])));
    }
  }
}
