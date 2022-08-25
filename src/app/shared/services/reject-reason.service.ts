import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { RejectReason, RejectReasonPage } from "@shared/models/reject-reason.model";

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
   public getClosureReasonsByPage(pageNumber?: number, pageSize?: number, orderBy?: string, getAll?: boolean): Observable<RejectReasonPage> {
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
      reason
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
  public getOrderRequisitionsByPage(pageNumber?: number, pageSize?: number, orderBy?: string, lastSelectedBusinessUnitId?: number): Observable<RejectReasonPage> {
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
}
