import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BillRateOption } from '@shared/models/bill-rate.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BillRateService {
  constructor(private http: HttpClient) {}

 /**
   * Get Bill Rate Options
   * @return list of Bill Rat eOptions
   */
  public getBillRateOptions(): Observable<BillRateOption[]> {
    return this.http.get<BillRateOption[]>(`/api/BillRates/options`);
  }
}
