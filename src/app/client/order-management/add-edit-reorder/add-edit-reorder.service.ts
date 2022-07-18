import { catchError, Observable, of } from 'rxjs';
import { Store } from '@ngxs/store';

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { AppState } from '../../../store/app.state';
import { CandidateModel } from '@client/order-management/add-edit-reorder/models/candidate.model';
import { ReorderRequestModel } from '@client/order-management/add-edit-reorder/models/reorder.model';

@Injectable({
  providedIn: 'root',
})
export class AddEditReorderService {
  public constructor(private http: HttpClient, private store: Store) {}

  public getCandidates(orderId: number, organizationId: number): Observable<CandidateModel[]> {
    const { isOrganizationArea } = this.store.selectSnapshot(AppState.isOrganizationAgencyArea);

    if (isOrganizationArea) {
      return this.getOrganizationCandidates(orderId);
    } else {
      return this.getAgencyCandidates(orderId, organizationId);
    }
  }

  public addReorder(reorder: ReorderRequestModel): Observable<void> {
    return this.http.put<void>('/api/reorders', reorder);
  }

  private getOrganizationCandidates(orderId: number): Observable<CandidateModel[]> {
    return this.http.get<CandidateModel[]>(`/api/reorders/${orderId}/candidatespool/`).pipe(catchError(() => of([])));
  }

  private getAgencyCandidates(orderId: number, organizationId: number): Observable<CandidateModel[]> {
    const params = { organizationId };
    return this.http
      .get<CandidateModel[]>(`/api/reorders/${orderId}/agenciespool/`, { params })
      .pipe(catchError(() => of([])));
  }
}
