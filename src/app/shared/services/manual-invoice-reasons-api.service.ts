import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { ManualInvoiceReason, ManualInvoiceReasonPage } from '@shared/models/manual-invoice-reasons.model';
import { RejectReason } from '@shared/models/reject-reason.model';

@Injectable({
  providedIn: 'root',
})
export class ManualInvoiceReasonsApiService {
  constructor(private http: HttpClient) {
  }

  /**
   * Get Manual reasons by page number
   * @param pageNumber
   * @param pageSize
   */
  public getManualInvoiceReasonsByPage(pageNumber: number, pageSize: number): Observable<ManualInvoiceReasonPage> {
    return this.http.get<ManualInvoiceReasonPage>(`/api/ManualInvoiceReasons?PageNumber=${pageNumber}&PageSize=${pageSize}`);
  }

  /**
   * Save reason
   * @param body
   */
  public postManualInvoiceReason(body: { reason: string }): Observable<ManualInvoiceReason> {
    return this.http.post<ManualInvoiceReason>('/api/ManualInvoiceReasons', body);
  }

  /**
   * Update reason
   * @param payload
   */
  public updateManualInvoiceReason(payload: ManualInvoiceReason): Observable<void> {
    return this.http.put<void>('/api/ManualInvoiceReasons', payload);
  }

  /**
   * Remove reason
   * @param id
   */
  public removeManualInvoiceReason(id: number): Observable<void> {
    return this.http.delete<void>(`/api/ManualInvoiceReasons/${id}`);
  }
}
