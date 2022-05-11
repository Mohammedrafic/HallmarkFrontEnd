import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { FeeExceptionsDTO, FeeExceptionsInitialData, FeeExceptionsPage } from '@shared/models/associate-organizations.model';

@Injectable({
  providedIn: 'root',
})
export class FeeExceptionsService {
  constructor(private http: HttpClient) {}

  /**
   * Get Fee Exceptions Initial Data By Organization Id
   * @param OrganizationId
   * @return Initial Data for Fee Exceptions
   */
  public getFeeExceptionsInitialData(OrganizationId: number): Observable<FeeExceptionsInitialData> {
    return this.http.get<FeeExceptionsInitialData>(`/api/FeeExceptions/initialData`, {
      params: { OrganizationId },
    });
  }

  /**
   * Save FeeExceptions
   * @param FeeExceptionsDTO
   * @return UpdatedFeeExceptionsPage
   */
  public saveFeeExceptions(feeExceptions: FeeExceptionsDTO): Observable<FeeExceptionsPage> {
    return this.http.put<FeeExceptionsPage>(`/api/FeeExceptions`, feeExceptions);
  }

  /**
   * Remove FeeExceptions
   * @param id
   */
  public removeFeeExceptionsById(id: number): Observable<never> {
    return this.http.delete<never>(`/api/FeeExceptions/${id}`);
  }
}
