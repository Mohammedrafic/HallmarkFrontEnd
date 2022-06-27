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

  //TODO: change api , when backend will be implement it
  /**
   * Get all reject reasons
   */
  public getAllRejectReasons(): Observable<RejectReasonPage> {
    return this.http.get<RejectReasonPage>(`/api/RejectReasons?PageNumber=1&PageSize=100`);
  }
}
