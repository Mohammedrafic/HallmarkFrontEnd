import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { AnalyticsDTO } from '@core/interface/analytics.interface';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsApiService<T> {
  constructor(private http: HttpClient) {
  }

  public postUIAction(body: AnalyticsDTO<T>): Observable<void> {
    return this.http.post<void>('/api/Audit/uiaction', body);
  }
}
