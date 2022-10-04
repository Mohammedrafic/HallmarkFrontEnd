import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { catchError, Observable, of } from 'rxjs';
import { take } from 'rxjs/operators';

import { AnalyticsDTO } from '@core/interface/analytics.interface';
import { AnalyticEventType, AnalyticTargetType } from '@shared/enums/analytic-event.enum';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsApiService<T> {
  constructor(private http: HttpClient) {
  }

  public postUIAction(body: AnalyticsDTO<T>): Observable<void | null> {
    return this.http.post<void>('/api/Audit/uiaction', body).pipe(
      take(1),
      catchError(() => of(null))
    );
  }

  public predefinedMenuClickAction(analyticData: T, analyticEventValue: string): Observable<void | null> {
    const body = {
      eventType: AnalyticEventType.Click,
      eventTargetType: AnalyticTargetType.Menu,
      eventTarget: analyticData,
      eventValue: analyticEventValue,
    };

    return this.http.post<void>('/api/Audit/uiaction', body).pipe(
      take(1),
      catchError(() => of(null))
    );
  }
}
