import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { Store } from '@ngxs/store';

import { AvailabilityRestriction } from '../interfaces';
import { PageOfCollections } from '@shared/models/page.model';
import { handleHttpError } from '@core/operators/http-error-handler';

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
      '/api/EmployeeAvailabilityRestrictions/all', payload).pipe(handleHttpError(this.store));
  }

  public saveAvailabilityRestriction(avalRestriction: AvailabilityRestriction): Observable<AvailabilityRestriction> {
    if (avalRestriction.id) {
      return this.updateAvailabilityRestriction(avalRestriction);
    } 
      
    return this.createAvailabilityRestriction(avalRestriction);
  }

  public deleteAvailabilityRestriction(id: number): Observable<void> {
    return this.httpClient.delete<void>(`/api/EmployeeAvailabilityRestrictions/${id}`)
      .pipe(handleHttpError(this.store));
  }

  private createAvailabilityRestriction(avalRestriction: AvailabilityRestriction): Observable<AvailabilityRestriction> {
    return this.httpClient.post<AvailabilityRestriction>('/api/EmployeeAvailabilityRestrictions', avalRestriction)
      .pipe(handleHttpError(this.store));
  }

  private updateAvailabilityRestriction(avalRestriction: AvailabilityRestriction): Observable<AvailabilityRestriction> {
    return this.httpClient.put<AvailabilityRestriction>('/api/EmployeeAvailabilityRestrictions', avalRestriction)
      .pipe(handleHttpError(this.store));
  }
}
