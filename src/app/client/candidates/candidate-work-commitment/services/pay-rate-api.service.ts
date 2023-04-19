import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { Store } from '@ngxs/store';

import { PayRateHistory } from '../interfaces';
import { handleHttpError } from '@core/operators/http-error-handler';

@Injectable()
export class PayRateApiService {
  constructor(
    private readonly httpClient: HttpClient,
    private readonly store: Store,
  ) { }

  public getPayRateRecords(): Observable<PayRateHistory[]> {
    return this.httpClient.get<PayRateHistory[]>('/api/PayRateHistory').pipe(handleHttpError(this.store));
  }

  public addPayRateRecord(payRate: PayRateHistory): Observable<PayRateHistory> {
    return this.httpClient.post<PayRateHistory>('/api/PayRateHistory', { payRate }).pipe(handleHttpError(this.store));
  }

  public deletePayRateRecord(id: number): Observable<void> {
    return this.httpClient.delete<void>('/api/PayRateHistory/' + id).pipe(handleHttpError(this.store));
  }
}
