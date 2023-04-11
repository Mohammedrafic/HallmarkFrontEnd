import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable, catchError } from 'rxjs';
import { Store } from '@ngxs/store';

import { AvailabilityRestriction } from '../interfaces';
import { PageOfCollections } from '@shared/models/page.model';
import { ShowToast } from 'src/app/store/app.actions';
import { getAllErrors } from '@shared/utils/error.utils';
import { MessageTypes } from '@shared/enums/message-types';

@Injectable()
export class AvailabilityApiService {
  constructor(
    private readonly httpClient: HttpClient,
    private readonly store: Store,
  ) { }

  public getAvailabilityRestrictions(
    employeeId: number,
    pageNumber: number
  ): Observable<PageOfCollections<AvailabilityRestriction>> {
    const payload = {
      employeeId: employeeId,
      pageNumber: pageNumber,
      pageSize: 5,
    };

    return this.httpClient.post<PageOfCollections<AvailabilityRestriction>>(
      '/api/EmployeeAvailabilityRestrictions/all', payload)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          return this.store.dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)));
        })
      );
  }

  public saveAvailabilityRestriction(avalRestriction: AvailabilityRestriction): Observable<AvailabilityRestriction> {
    return this.httpClient.post<AvailabilityRestriction>('/api/EmployeeAvailabilityRestrictions', avalRestriction)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          return this.store.dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)));
        })
      );
  }

  public deleteAvailabilityRestriction(id: number): Observable<void> {
    return this.httpClient.delete<void>(`/api/EmployeeAvailabilityRestrictions/${id}`)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          return this.store.dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)));
        })
      );
  }
}
