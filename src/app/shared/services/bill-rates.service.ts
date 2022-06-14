import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BillRateOption, BillRateSetup, BillRateSetupPage, BillRateSetupPost } from '@shared/models/bill-rate.model';

@Injectable({
  providedIn: 'root'
})
export class BillRatesService {
  constructor(private http: HttpClient) { }

  /**
   * Get the list of bill rates
   * @return Array of bill rates
   */
  public getBillRates(pageNumber: number, pageSize: number): Observable<BillRateSetupPage> {
    return this.http.get<any>(`/api/BillRates/setup`, { params: { PageNumber: pageNumber, PageSize: pageSize } });
  }

  /**
   * Create or save/update bill rate
   * @param billRate object to save/update
   * @return Created/Updated bill rate
   */
  public saveUpdateBillRate(billRate: BillRateSetupPost): Observable<BillRateSetup[]> {
    return this.http.post<BillRateSetup[]>(`/api/BillRates/setup`, billRate);
  }

    /**
   * Remove bill rate by its id
   * @param id
   */
  public removeBillRateById(id: number): Observable<void> { // TODO: pending BE implementation
    return this.http.delete<void>(`/api/BillRates/setup/${id}`);
  }

  /**
   * Get Bill Rate Options
   * @return list of Bill Rate eOptions
   */
  public getBillRateOptions(): Observable<BillRateOption[]> {
    return this.http.get<BillRateOption[]>(`/api/BillRates/options`);
  }
}
