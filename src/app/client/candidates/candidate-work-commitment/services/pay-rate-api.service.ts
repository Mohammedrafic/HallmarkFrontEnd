import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { Store } from '@ngxs/store';

import { PayRateHistory } from '../interfaces';
import { handleHttpError } from '@core/operators/http-error-handler';
import { PageOfCollections } from '@shared/models/page.model';

@Injectable()
export class PayRateApiService {
  constructor(
    private readonly httpClient: HttpClient,
    private readonly store: Store,
  ) { }

  public getPayRateRecords(
    payload: {
      employeeId: number,
      employeeWorkCommitmentId: number,
      pageNumber: number,
      pageSize: number,
    }
  ): Observable<PageOfCollections<PayRateHistory>> {
    return this.httpClient.post<PageOfCollections<PayRateHistory>>
      ('/api/EmployeeWorkCommitmentPayRates/list', payload)
      .pipe(handleHttpError(this.store));
  }

  public addPayRateRecord(
    payload: {
      employeeWorkCommitmentId: number,
      payRate: number,
      startDate: string,
    }
  ): Observable<PayRateHistory> {
    return this.httpClient.post<PayRateHistory>('/api/EmployeeWorkCommitmentPayRates', { ...payload })
      .pipe(handleHttpError(this.store));
  }

  public deletePayRateRecord(id: number): Observable<void> {
    return this.httpClient.delete<void>('/api/EmployeeWorkCommitmentPayRates/' + id).pipe(handleHttpError(this.store));
  }
}
