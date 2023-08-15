import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';

import { ManualInvoiceReason, ManualInvoiceReasonPage } from '@shared/models/manual-invoice-reasons.model';

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
  public postManualInvoiceReason(body: { reason: string, agencyFeeApplicable: boolean }): Observable<ManualInvoiceReason> {
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
  public removeManualInvoiceReason(id: number,businessUnitId?: number): Observable<void> {
    const headers = businessUnitId ? new HttpHeaders({ 'selected-businessunit-id': `${businessUnitId}` }) : {};
    return this.http.delete<void>(`/api/ManualInvoiceReasons/${id}`, { headers });
  }
}
