import { catchError, Observable, of } from 'rxjs';
import { Store } from '@ngxs/store';

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { AppState } from '../../../store/app.state';
import { AgencyModel, CandidateModel } from '@client/order-management/add-edit-reorder/models/candidate.model';
import { ReorderRequestModel } from '@client/order-management/add-edit-reorder/models/reorder.model';
import { getTimeFromDate, setTimeToDate } from '@shared/utils/date-time.utils';

@Injectable({
  providedIn: 'root',
})
export class AddEditReorderService {
  public constructor(private http: HttpClient, private store: Store) {}

  public getCandidates(orderId: number, organizationId: number): Observable<CandidateModel[]> {
    const { isAgencyArea } = this.store.selectSnapshot(AppState.isOrganizationAgencyArea);
    const params = { organizationId };
    const endpoint = `/api/reorders/${orderId}/candidatespool/`;

    if (isAgencyArea) {
      return this.http.get<CandidateModel[]>(endpoint, { params }).pipe(catchError(() => of([])));
    } else {
      return this.http.get<CandidateModel[]>(endpoint).pipe(catchError(() => of([])));
    }
  }

  public getAgencies(orderId: number, organizationId: number): Observable<AgencyModel[]> {
    const { isAgencyArea } = this.store.selectSnapshot(AppState.isOrganizationAgencyArea);
    const endpoint = `/api/reorders/${orderId}/agenciespool/`;
    const params = { organizationId };

    if (isAgencyArea) {
      return this.http.get<AgencyModel[]>(endpoint, { params }).pipe(catchError(() => of([])));
    } else {
      return this.http.get<AgencyModel[]>(endpoint).pipe(catchError(() => of([])));
    }
  }

  public saveReorder({ reOrderId, reOrderFromId, agencyIds, reorder }: ReorderRequestModel): Observable<void> {
    const prepareFields = {
      reOrderId,
      reOrderFromId,
      agencyIds,
      candidateProfileIds: reorder.candidates,
      reorderDate: reorder.reorderDate,
      shiftEndTime: setTimeToDate(getTimeFromDate(reorder.shiftEndTime)),
      shiftStartTime: setTimeToDate(getTimeFromDate(reorder.shiftStartTime)),
      billRate: reorder.billRate,
      openPositions: reorder.openPosition,
    };
    return this.http.put<void>('/api/reorders', prepareFields);
  }
}
