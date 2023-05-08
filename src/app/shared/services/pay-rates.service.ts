import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  PayRateFilters,
  PayRateSetup,
  PayRateSetupPage,
  PayRateSetupPost,
  ImportedPayRate,
} from '@shared/models/pay-rate.model';
import { ExportPayload } from '@shared/models/export.model';
import { MasterCommitmentsPage } from '@shared/models/commitment.model';

@Injectable({
  providedIn: 'root',
})
export class PayRateService {
  constructor(private http: HttpClient) {}

  public getPayRates(filter: PayRateFilters): Observable<PayRateSetupPage> {
    return this.http.post<PayRateSetupPage>(`/api/PayRates/setup/getFiltered`, filter);
  }

  public saveUpdatePayRate(billRate: PayRateSetupPost): Observable<PayRateSetup[]> {
    return this.http.post<PayRateSetup[]>(`/api/PayRates/setup`, billRate);
  }

  public removePayRateById(id: number): Observable<void> {
    return this.http.delete<void>(`/api/PayRates/setup/${id}`);
  }

  public exportPayRateSetup(payload: ExportPayload): Observable<any> {
    return this.http.post(`/api/PayRates/export`, payload, { responseType: 'blob' });
  }

  public getPayRatesImportTemplate(errorRecords: ImportedPayRate[]): Observable<any> {
    return this.http.post('/api/PayRates/template', errorRecords, { responseType: 'blob' });
  }

  public getskillsbyDepartment(id: number[]): Observable<any> {
    return this.http.post('/api/PayRates/skillsByDepartment', {departmentIds : id});
  }

  public getMasterWorkCommitments(currentPage: number, pageSize: number): Observable<MasterCommitmentsPage> {
    return this.http.post<MasterCommitmentsPage>('/api/MasterWorkCommitment/getAll', { currentPage, pageSize });
  }
}
