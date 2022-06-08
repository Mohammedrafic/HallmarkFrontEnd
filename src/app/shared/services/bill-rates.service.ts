import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BillRatesService {
  constructor(private http: HttpClient) { }

  /**
   * Get the list of bill rates
   * @return Array of bill rates
   */
  public getBillRates(): Observable<any> { // TODO: pending BE implementation
    return this.http.get<any>(`/api/BillRates`);
  }

  /**
   * Create or save/update bill rate
   * @param billRate object to save/update
   * @return Created/Updated bill rate
   */
  public saveUpdateBillRate(billRate: any): Observable<any> { // TODO: pending BE implementation
    return billRate.id ?
      this.http.put<any>(`/api/BillRates`, billRate) :
      this.http.post<any>(`/api/BillRates`, billRate);
  }

    /**
   * Remove bill rate by its id
   * @param id
   */
  public removeBillRateById(id: number): Observable<void> { // TODO: pending BE implementation
    return this.http.delete<void>(`/api/BillRates/${id}`);
  }
}
