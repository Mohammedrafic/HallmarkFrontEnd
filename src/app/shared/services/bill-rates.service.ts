import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {
  BillRateFilters,
  BillRateOption,
  BillRateSetup,
  BillRateSetupPage,
  BillRateSetupPost, ExternalBillRateTypePage,
  ExternalBillRateType, ExternalBillRateSave
} from '@shared/models/bill-rate.model';
import { ExportPayload } from '@shared/models/export.model';

@Injectable({
  providedIn: 'root'
})
export class BillRatesService {
  constructor(private http: HttpClient) { }

  /**
   * Get the list of bill rates
   * @param filter filter parameters
   * @return Array of bill rates
   */
  public getBillRates(filter: BillRateFilters): Observable<BillRateSetupPage> {
    return this.http.post<BillRateSetupPage>(`/api/BillRates/setup/getFiltered`, filter);
  }

  /**
   * Get the list of bill rates types
   * @param filter filter parameters
   * @return Array of bill rates types
   */
  public getExternalBillRates(filter: BillRateFilters): Observable<ExternalBillRateTypePage> {
    const {pageNumber = 1, pageSize = 1} = filter;
    return this.http.get<ExternalBillRateTypePage>(
      `/api/ExternalBillRates`,
      { params: { PageNumber: pageNumber, PageSize: pageSize }});
  }

  /**
   * Create or save/update bill rate type
   * @param billRate object to save/update
   * @return Created/Updated bill rate
   */
  public saveUpdateBillRate(billRate: BillRateSetupPost): Observable<BillRateSetup[]> {
    return this.http.post<BillRateSetup[]>(`/api/BillRates/setup`, billRate);
  }

  /**
   * Create bill rate
   * @param billRate object to save
   * @return Created bill rate
   */
  public saveExternalBillRateType(billRate: ExternalBillRateSave): Observable<ExternalBillRateType> {
    return this.http.post<ExternalBillRateType>(`/api/ExternalBillRates`, billRate);
  }

  /**
   * Update bill rate
   * @param id object to update
   * @return Update bill rate
   */
  public updateExternalBillRateType(id: number, billRate: ExternalBillRateSave): Observable<ExternalBillRateType> {
    return this.http.put<ExternalBillRateType>(`/api/ExternalBillRates/${id}`, billRate);
  }

    /**
   * Remove bill rate by its id
   * @param id
   */
  public removeBillRateById(id: number): Observable<void> {
    return this.http.delete<void>(`/api/BillRates/setup/${id}`);
  }

  /**
   * Remove bill rate type by its id
   * @param id
   */
  public removeExternalBillRateById(id: number): Observable<void> {
    return this.http.delete<void>(`/api/ExternalBillRates/${id}`);
  }

  /**
   * Get Bill Rate Options
   * @return list of Bill Rate eOptions
   */
  public getBillRateOptions(): Observable<BillRateOption[]> {
    return this.http.get<BillRateOption[]>(`/api/BillRates/options`);
  }

  /**
   * Export bill rate setup
   */
  public exportBillRateSetup(payload: ExportPayload): Observable<any> {
    return this.http.post(`/api/BillRates/export`, payload, { responseType: 'blob' });
  }
}
