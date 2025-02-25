import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { GetQueryParams } from '@core/helpers/functions.helper';
import { CancelEmployeeReasonValue, UnavailabilityValue } from '@organization-management/reasons/interfaces';
import { PageOfCollections } from '@shared/models/page.model';
import { Penalty, PenaltyPage, PenaltyPayload } from '@shared/models/penalty.model';
import {
  CancelEmployeeReasons,
  RecuriterReasonPage,
  RejectReason,
  RejectReasonPage,
  RejectReasonwithSystem,
  SourcingReasonPage,
  UnavailabilityPaging,
  UnavailabilityReasons,
} from '@shared/models/reject-reason.model';
import { GetSourcingConfigModel } from '@shared/models/organization.model';
import { SystemType } from '@shared/enums/system-type.enum';

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

  public getAllRejectReasons(systemType?: SystemType): Observable<RejectReasonPage> {
    if (systemType !== null && systemType !== undefined) {
      return this.http.get<RejectReasonPage>(`/api/RejectReasons`, {
        params: GetQueryParams({systemType}),
      });
    }

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
   public getClosureReasonsByPage(
     pageNumber?: number,
     pageSize?: number,
     orderBy?: string,
     getAll?: boolean,
     excludeDefaultReasons = false
  ): Observable<RejectReasonPage> {
     const params = this.getCloseReasonsParams(
       pageNumber,
       pageSize,
       orderBy,
       getAll,
       false,
       excludeDefaultReasons
     );

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
    const { agencyFeeApplicable } = payload;
    return this.http.post<RejectReason>('/api/ManualInvoiceReasons', {
      reason, agencyFeeApplicable,
    });
  }

  public removeManualInvoiceReason(id: number): Observable<void> {
    return this.http.delete<void>(`/api/ManualInvoiceReasons/${id}`);
  }

  public updateManualInvoiceReason(payload: RejectReason): Observable<void> {
    return this.http.put<void>('/api/ManualInvoiceReasons', payload);
  }

  private getCloseReasonsParams(
    pageNumber?: number,
    pageSize?: number,
    orderBy?: string,
    getAll?: boolean,
    excludeOpenPositionReason?: boolean,
    excludeDefaultReasons?: boolean,
  ): HttpParams {
    let params = {};

    if (pageNumber) {
      params = {...params, pageNumber};
    }
    if (pageSize) {
      params = {...params, pageSize};
    }

    if (orderBy) {
      params = {...params, orderBy};
    }

    if (getAll) {
      params = {...params, getAll};
    }

    if (excludeOpenPositionReason) {
      params = {...params, excludeOpenPositionReason};
    }

    if (excludeDefaultReasons) {
      params = {...params, excludeDefaultReasons};
    }

    return <HttpParams>params;
  }

  /**
   * Remove order requisition
   * @param id
   */
  public removeOrderRequisition(id: number): Observable<void> {
    return this.http.delete<void>(`/api/OrderRequisition/${id}`);
  }

  public getOrderRequisitionsByPage(
    pageNumber?: number,
    pageSize?: number,
    orderBy?: string,
    lastSelectedBusinessUnitId?: number,
    excludeOpenPositionReason?: boolean,
  ): Observable<RejectReasonPage> {
    const params = this.getCloseReasonsParams(pageNumber, pageSize, orderBy, false, excludeOpenPositionReason);
    let headers = {};
    if (lastSelectedBusinessUnitId) {
      headers = new HttpHeaders({ 'selected-businessunit-id': `${lastSelectedBusinessUnitId}` });
    }

    return this.http.post<RejectReasonPage>(`/api/OrderRequisition/all`, params , { headers });
  }

  /**
   * Save order requisition
   * @param payload
   */
  public saveOrderRequisitions(payload: RejectReasonwithSystem): Observable<RejectReasonwithSystem> {
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

  public getCancelEmployeeReasons(params: UnavailabilityPaging): Observable<PageOfCollections<CancelEmployeeReasons>> {
    return this.http.get<PageOfCollections<CancelEmployeeReasons>>('/api/CancellationReason', {
      params: GetQueryParams(params),
    });
  }

  public saveCancelEmployeeReason(data: CancelEmployeeReasonValue): Observable<void> {
    if(data.id) {
      return this.http.put<void>('/api/CancellationReason', data);
    }

    return this.http.post<void>('/api/CancellationReason', data);
  }

  public saveUnavailabilityReason(data: UnavailabilityValue): Observable<void> {
    return this.http.post<void>('/api/UnavailabilityReasons', data);
  }

  public removeUnavailabilityReason(id: number): Observable<void> {
    return this.http.delete<void>(`/api/UnavailabilityReasons/${id}`);
  }

  public removeCancelEmployeeReason(id: number): Observable<void> {
    return this.http.delete<void>(`/api/CancellationReason/${id}`);
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

  public getInactivationReason(pageNumber: number, pageSize: number): Observable<RejectReasonPage> {
    return this.http.get<RejectReasonPage>(`/api/InactivationReason?PageNumber=${pageNumber}&PageSize=${pageSize}`);
  }
  public GetSourcingReasons(payload?:any): Observable<any> {
    return this.http.post<any>(`/api/Employee/getSourcing`,payload);
  }

  public saveInactivationReason(payload : RejectReason): Observable<RejectReason> {
    return this.http.post<RejectReason>('/api/InactivationReason', payload);
  }

  public removeInactivationReason(id: number): Observable<void> {
    return this.http.delete<void>(`/api/InactivationReason?reasonId=${id}`);
  }

  public updateInactivationReason(payload: RejectReason): Observable<void> {
    return this.http.put<void>('/api/InactivationReason', payload);
  }

  public getCategoryNoteReason(pageNumber: number, pageSize: number): Observable<RejectReasonPage> {
    return this.http.get<RejectReasonPage>(`/api/CategoryReason?PageNumber=${pageNumber}&PageSize=${pageSize}`);
  }

  public saveCategoryNoteReason(payload: {reason: string}): Observable<RejectReason> {
    return this.http.post<RejectReason>('/api/CategoryReason', payload);
  }

  public removeCategoryNoteReason(id: number): Observable<void> {
    return this.http.delete<void>(`/api/CategoryReason?reasonId=${id}`);
  }

  public updateCategoryNoteReason(payload: RejectReason): Observable<void> {
    return this.http.put<void>('/api/CategoryReason', payload);
  }




  //Recuriter-Reasons
   /**
   * Save Recuriter
   * @param payload
   */
   public saveRecuriterReasons(payload: {reason: string}): Observable<RejectReason> {
    return this.http.post<RejectReason>('/api/Recruiters', payload);
  }

  /**
   * Remove Recuriter
   * @param id
   */
  public removeRecuriterReason(id: number): Observable<void> {
    return this.http.delete<void>(`/api/Recruiters?id=${id}`);
  }

  /**
   * Update Recuriter
   * @param payload
   */
  public updateRecuriterReason(payload: RejectReason): Observable<void> {
    return this.http.put<void>('/api/Recruiters', payload);
  }


  /**
   * Get reasons by page number
   * @param pageNumber
   * @param pageSize
   */
  public getRecuriterReasonsByPage(pageNumber: number, pageSize: number): Observable<RecuriterReasonPage> {
    return this.http.get<RecuriterReasonPage>(`/api/Recruiters?PageNumber=${pageNumber}&PageSize=${pageSize}`);
  }


  //Sourcing

  //Sourcing-Reasons
   /**
   * Save Sourcing
   * @param payload
   */
   public saveSourcingReasons(payload: {reason: string}): Observable<RejectReason> {
    return this.http.post<RejectReason>('/api/Sourcing', payload);
  }

  /**
   * Remove Sourcing
   * @param id
   */
  public removeSourcingReason(id: number): Observable<void> {
    return this.http.delete<void>(`/api/Sourcing?id=${id}`);
  }

  /**
   * Update Sourcing
   * @param payload
   */
  public updateSourcingReason(payload: RejectReason): Observable<void> {
    return this.http.put<void>('/api/Sourcing', payload);
  }


  /**
   * Get Sourcing by page number
   * @param pageNumber
   * @param pageSize
   */
  public getSourcingReasonsByPage(pageNumber: number, pageSize: number): Observable<SourcingReasonPage> {
    return this.http.get<SourcingReasonPage>(`/api/Sourcing?PageNumber=${pageNumber}&PageSize=${pageSize}`);
  }

  public GetSourcingConfig(payload?:any): Observable<GetSourcingConfigModel> {
    return this.http.post<any>(`/api/Employee/getSourcingConfig`,payload);
  }
}
