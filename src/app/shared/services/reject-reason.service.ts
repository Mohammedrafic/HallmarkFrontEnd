import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { GetQueryParams } from '@core/helpers/functions.helper';
import { UnavailabilityValue } from '@organization-management/reasons/interfaces';
import { PageOfCollections } from '@shared/models/page.model';
import { Penalty, PenaltyPage, PenaltyPayload } from '@shared/models/penalty.model';
import {
  RejectReason, RejectReasonPage, UnavailabilityPaging, UnavailabilityReasons,
} from '@shared/models/reject-reason.model';

/**
 * TODO: provide service in modules instead of root.
 */
@Injectable({ providedIn: 'root' })
export class RejectReasonService {
  constructor(private http: HttpClient) { }

  /**
   * Get reasons by page number
   * @param pageNumber
   * @param pageSize
   */
  public getRejectReasonsByPage(pageNumber: number, pageSize: number): Observable<RejectReasonPage> {
    return this.http.get<RejectReasonPage>(`/api/RejectReasons?PageNumber=${pageNumber}&PageSize=${pageSize}`);
  }

  /**
   * Save reason
   * @param payload
   */
  public saveRejectReasons(payload: {reason: string}): Observable<RejectReason> {
    return this.http.post<RejectReason>('/api/RejectReasons', payload);
  }

  /**
   * Remove reason
   * @param id
   */
  public removeRejectReason(id: number): Observable<void> {
    return this.http.delete<void>(`/api/RejectReasons/${id}`);
  }

  /**
   * Update reason
   * @param payload
   */
  public updateRejectReason(payload: RejectReason): Observable<void> {
    return this.http.put<void>('/api/RejectReasons', payload);
  }

  /**
   * Get all reject reasons
   */
  public getAllRejectReasons(): Observable<RejectReasonPage> {
    return this.http.get<RejectReasonPage>(`/api/RejectReasons`);
  }

  /**
   * Remove closure reason
   * @param id
   */
  public removeClosureReason(id: number): Observable<void> {
    return this.http.delete<void>(`/api/orderclosurereasons`, { params : { ReasonId: id }});
  }
  
  /**
   * Get closure reasons by page number
   * @param pageNumber
   * @param pageSize
   * @param orderBy
   */
   public getClosureReasonsByPage(pageNumber?: number, pageSize?: number, orderBy?: string,
    getAll?: boolean): Observable<RejectReasonPage> {
     const params = this.getCloseReasonsParams(pageNumber, pageSize, orderBy, getAll);

    return this.http.get<RejectReasonPage>(`/api/orderclosurereasons`,
      { params }
    );
  }

  /**
   * Save reason
   * @param payload
   */
  public saveClosureReasons(payload: RejectReason): Observable<RejectReason> {
    payload.id = payload.id || 0;
    return this.http.put<RejectReason>('/api/orderclosurereasons', payload);
  }

  public getManualInvoiceReasonsByPage(
    pageNumber?: number,
    pageSize?: number,
    orderBy?: string,
    getAll?: boolean
  ): Observable<RejectReasonPage> {
    return this.http.get<RejectReasonPage>('/api/ManualInvoiceReasons', {
      params: this.getCloseReasonsParams(pageNumber, pageSize, orderBy, getAll),
    });
  }

  public saveManualInvoiceReason(payload: RejectReason): Observable<RejectReason> {
    const { reason } = payload;

    return this.http.post<RejectReason>('/api/ManualInvoiceReasons', {
      reason,
    });
  }

  public removeManualInvoiceReason(id: number): Observable<void> {
    return this.http.delete<void>(`/api/ManualInvoiceReasons/${id}`);
  }

  public updateManualInvoiceReason(payload: RejectReason): Observable<void> {
    return this.http.put<void>('/api/ManualInvoiceReasons', payload);
  }

  private getCloseReasonsParams(pageNumber?: number, pageSize?: number, orderBy?: string, getAll?: boolean): HttpParams {
    let params = {};
    if (pageNumber) params = {...params, pageNumber};
    if (pageSize) params = {...params, pageSize};
    if (orderBy) params = {...params, orderBy};
    if (getAll) params = {...params, getAll};

    return <HttpParams>params;
  }

  /**
   * Remove order requisition
   * @param id
   */
  public removeOrderRequisition(id: number): Observable<void> {
    return this.http.delete<void>(`/api/OrderRequisition/${id}`);
  }
  
  /**
   * Get order requisitions by page number
   * @param pageNumber
   * @param pageSize
   * @param orderBy
   */
  public getOrderRequisitionsByPage(pageNumber?: number, pageSize?: number, orderBy?: string,
    lastSelectedBusinessUnitId?: number): Observable<RejectReasonPage> {
    const params = this.getCloseReasonsParams(pageNumber, pageSize, orderBy);
    let headers = {};
    if (lastSelectedBusinessUnitId) {
      headers = new HttpHeaders({ 'selected-businessunit-id': `${lastSelectedBusinessUnitId}` });
    }

    return this.http.post<RejectReasonPage>(`/api/OrderRequisition/all`,
      { params }, { headers }
    );
  }

  /**
   * Save order requisition
   * @param payload
   */
  public saveOrderRequisitions(payload: RejectReason): Observable<RejectReason> {
    payload.id = payload.id || 0;
    if (payload.id) {
      return this.http.put<RejectReason>('/api/OrderRequisition', payload);
    }
    return this.http.post<RejectReason>('/api/OrderRequisition', payload);
  }


  /**
   * Get penalties by page number
   * @param pageNumber
   * @param pageSize
   */
   public getPenaltiesByPage(pageNumber: number, pageSize: number): Observable<PenaltyPage> {
    return this.http.post<PenaltyPage>(`/api/CandidateCancellationSettings/setup/getFiltered`, { pageNumber, pageSize });
  }

  /**
   * Save penalty
   * @param payload
   */
  public savePenalty(payload: PenaltyPayload): Observable<Penalty[]> {
    return this.http.post<Penalty[]>('/api/CandidateCancellationSettings/setup', payload);
  }

  /**
   * Remove reason
   * @param id
   */
  public removePenalty(id: number): Observable<void> {
    return this.http.delete<void>(`/api/CandidateCancellationSettings/setup/${id}`);
  }

  public getUnavailabilityReasons(params: UnavailabilityPaging): Observable<PageOfCollections<UnavailabilityReasons>> {
    return this.http.get<PageOfCollections<UnavailabilityReasons>>('/api/UnavailabilityReasons', {
      params: GetQueryParams(params),
    });
  }

  public saveUnavailabilityReason(data: UnavailabilityValue): Observable<void> {
    return this.http.post<void>('/api/UnavailabilityReasons', data);
  }

  public removeUnavailabilityReason(id: number): Observable<void> {
    return this.http.delete<void>(`/api/UnavailabilityReasons/${id}`);
  }

  public getInternalTransferReason(pageNumber: number, pageSize: number): Observable<RejectReasonPage> {
    return this.http.get<RejectReasonPage>(`/api/InternalTransferRecruitmentReasons?PageNumber=${pageNumber}&PageSize=${pageSize}`);
  }

  public saveInternalTransferReason(payload: {reason: string}): Observable<RejectReason> {
    return this.http.post<RejectReason>('/api/InternalTransferRecruitmentReasons', payload);
  }

  public removeInternalTransferReason(id: number): Observable<void> {
    return this.http.delete<void>(`/api/InternalTransferRecruitmentReasons?reasonId=${id}`);
  }

  public updateInternalTransferReason(payload: RejectReason): Observable<void> {
    return this.http.put<void>('/api/InternalTransferRecruitmentReasons', payload);
  }

  public getTerminationReason(pageNumber: number, pageSize: number): Observable<RejectReasonPage> {
    return this.http.get<RejectReasonPage>(`/api/TerminatedReason?PageNumber=${pageNumber}&PageSize=${pageSize}`);
  }

  public saveTerminationReason(payload: {reason: string}): Observable<RejectReason> {
    return this.http.post<RejectReason>('/api/TerminatedReason', payload);
  }

  public removeTerminationReason(id: number): Observable<void> {
    return this.http.delete<void>(`/api/TerminatedReason?reasonId=${id}`);
  }

  public updateTerminationReason(payload: RejectReason): Observable<void> {
    return this.http.put<void>('/api/TerminatedReason', payload);
  }

}
