import { BehaviorSubject, catchError, map, Observable, of } from 'rxjs';
import { Store } from '@ngxs/store';

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { AppState } from '../../../store/app.state';
import { AgencyModel, CandidateModel } from '@client/order-management/add-edit-reorder/models/candidate.model';
import { ReorderRequestModel } from '@client/order-management/add-edit-reorder/models/reorder.model';
import { getTimeFromDate, setTimeToDate } from '@shared/utils/date-time.utils';
import { OrderManagementContentService } from '@shared/services/order-management-content.service';
import { OrderType } from '@shared/enums/order-type';
import { BillRate } from '@shared/models';
import { SidebarDialogTitlesEnum } from '@shared/enums/sidebar-dialog-titles.enum';

@Injectable({
  providedIn: 'root',
})
export class AddEditReorderService {
  private readonly reOrderDialogTitle: BehaviorSubject<string> = new BehaviorSubject<string>(
    SidebarDialogTitlesEnum.AddReOrder
  );

  public get reOrderDialogTitle$(): Observable<string> {
    return this.reOrderDialogTitle.asObservable();
  }

  public constructor(
    private http: HttpClient,
    private store: Store,
    private orderManagementContentService: OrderManagementContentService
  ) {}

  public setReOrderDialogTitle(title: SidebarDialogTitlesEnum): void {
    this.reOrderDialogTitle.next(title);
  }

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

  public getBillRate(departmentId: number, skillId: number): Observable<number> {
    return this.orderManagementContentService
      .getPredefinedBillRates(OrderType.OpenPerDiem, departmentId, skillId)
      .pipe(map((billRates: BillRate[]) => billRates[0].rateHour));
  }
}
