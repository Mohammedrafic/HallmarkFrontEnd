import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import {
  BillRate,
  BillRateFilters,
  BillRateOption,
  BillRateSetup,
  BillRateSetupPage,
  BillRateSetupPost,
  ExternalBillRateMapped,
  ExternalBillRateMappingPage,
  ExternalBillRateSave,
  ExternalBillRateType,
  ExternalBillRateTypePage,
  ImportedBillRate,
} from '@shared/models/bill-rate.model';
import { ExportPayload } from '@shared/models/export.model';
import { ImportResult } from '@shared/models/import.model';
import { sortByField } from '@shared/helpers/sort-by-field.helper';

@Injectable({
  providedIn: 'root',
})
export class BillRatesService {
  constructor(private http: HttpClient) {}

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
    const { pageNumber = 1, pageSize = 1, name = '' } = filter;
    return this.http.get<ExternalBillRateTypePage>(`/api/ExternalBillRates`, {
      params: { PageNumber: pageNumber, PageSize: pageSize, Name: name },
    });
  }

  /**
   * Get the list of bill rates mapping
   * @param filter filter parameters
   * @return Array of bill rates mapping
   */
  public getExternalBillRateMapping(filter: BillRateFilters): Observable<ExternalBillRateMappingPage> {
    const { pageNumber = 1, pageSize = 1, name = '' } = filter;
    return this.http.get<ExternalBillRateMappingPage>(`/api/BillRatesConfigs/ExternalBillRateMappings`, {
      params: { PageNumber: pageNumber, PageSize: pageSize, Name: name },
    });
  }

  /**
   * Get the list of bill rates mapping for specific id
   * @param filter filter parameters
   * @return Array of bill rates mapping
   */
  public getExternalBillRateMappingById(id: number): Observable<ExternalBillRateMapped[]> {
    return this.http.get<ExternalBillRateMapped[]>(`/api/BillRatesConfigs/${id}/ExternalBillRateMappings`).pipe(map((data) => sortByField(data, 'externalBillRateName')));
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
   * Create/update bill rate mapping
   * @param billRate object to save
   * @return Created/update bill rate mapping
   */
  public saveUpdateExternalBillRateMapping(id: number, ids: Array<{ id: number }>): Observable<ExternalBillRateType> {
    return this.http.post<ExternalBillRateType>(`/api/BillRatesConfigs/${id}/ExternalBillRateMappings`, {
      externalBillRates: ids,
    });
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
   * Remove bill rate mapping by its id
   * @param id
   */
  public removeExternalBillRateMappingById(id: number): Observable<void> {
    return this.http.delete<void>(`/api/BillRatesConfigs/${id}/ExternalBillRateMappings`);
  }

  /**
   * Get Bill Rate Options
   * @return list of Bill Rate eOptions
   */
  public getBillRateOptions(): Observable<BillRateOption[]> {
    return this.http.get<BillRateOption[]>(`/api/BillRates/options`).pipe(map((data) => sortByField(data, 'title')));
  }

  /**
   * Export bill rate setup
   */
  public exportBillRateSetup(payload: ExportPayload): Observable<any> {
    return this.http.post(`/api/BillRates/export`, payload, { responseType: 'blob' });
  }

  /**
   * Export external bill rate
   */
  public exportExternalBillRate(payload: ExportPayload): Observable<any> {
    return this.http.post(`/api/ExternalBillRates/export`, payload, { responseType: 'blob' });
  }

  /**
   * Export external bill rate mapping
   */
  public exportExternalBillRateMapping(payload: ExportPayload): Observable<any> {
    return this.http.post(`/api/BillRatesConfigs/export`, payload, { responseType: 'blob' });
  }

  public saveBillRatesImportResult(
    successfulRecords: ImportedBillRate[]
  ): Observable<ImportResult<ImportedBillRate>> {
    return this.http.post<ImportResult<ImportedBillRate>>('/api/BillRates/saveimport', successfulRecords);
  }

  public uploadBillRatesFile(file: Blob): Observable<ImportResult<ImportedBillRate>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ImportResult<ImportedBillRate>>('/api/BillRates/import', formData);
  }

  public getBillRatesImportTemplate(errorRecords: ImportedBillRate[]): Observable<any> {
    return this.http.post('/api/BillRates/template', errorRecords, { responseType: 'blob' });
  }

  public getCandidateBillRates(jobId: number, orgId: number, isAgency: boolean): Observable<BillRate[]> {
    const endpoint = isAgency ?
    `/api/Jobs/${jobId}/billrates/${orgId}` : `/api/Jobs/${jobId}/billrates`;

    return this.http.get<BillRate[]>(endpoint);
  }
  
  public getExtensionRates(jobId: number): Observable<BillRate[]> {
    return this.http.get<BillRate[]>(`/api/candidatejobs/${jobId}/billrates`);
  }
}
