import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
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
   public getClosureReasonsByPage(pageNumber: number, pageSize: number, orderBy: string): Observable<RejectReasonPage> {
    return this.http.get<RejectReasonPage>(`/api/orderclosurereasons`, { params: { pageNumber: pageNumber, pageSize: pageSize, orderBy: orderBy } });
  }

  /**
   * Save reason
   * @param payload
   */
  public saveClosureReasons(payload: RejectReason): Observable<RejectReason> {
    payload.id = payload.id || 0;
    return this.http.put<RejectReason>('/api/orderclosurereasons', payload);
  }
}
