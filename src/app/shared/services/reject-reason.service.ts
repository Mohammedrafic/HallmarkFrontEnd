import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
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

  private getCloseReasonsParams(pageNumber?: number, pageSize?: number, orderBy?: string, getAll?: boolean): HttpParams {
    let params = {};
    if (pageNumber) params = {...params, pageNumber};
    if (pageSize) params = {...params, pageSize};
    if (orderBy) params = {...params, orderBy};
    if (getAll) params = {...params, getAll};

    return <HttpParams>params;
  }
}
