import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { OrderApplicantsApplyData, OrderApplicantsInitialData } from '@shared/models/order-applicants.model';
import { DeployedCandidateOrderInfo } from '@shared/models/deployed-candidate-order-info.model';

@Injectable({ providedIn: 'root' })
export class OrderApplicantsService {
  constructor(private http: HttpClient) {}

  /**
   * Get the order applicants data
   * @param orderId
   * @param organizationId
   * @param candidateId
   * @return Order Applicants Initial Data
   */
  public getOrderApplicantsData(
    orderId: number,
    organizationId: number,
    candidateId: number
  ): Observable<OrderApplicantsInitialData> {
    return this.http.get<OrderApplicantsInitialData>(`/api/OrderApplicants/initialData`, {
      params: { OrderId: orderId, OrganizationId: organizationId, CandidateId: candidateId },
    });
  }

  /**
   * Apply Order Applicants
   */
  public applyOrderApplicants(order: OrderApplicantsApplyData): Observable<never> {
    return this.http.post<never>(`/api/OrderApplicants/apply`, order);
  }

  public getDeployedCandidateOrderInfo(
    orderId: number,
    candidateProfileId: number,
    organizationId: number
  ): Observable<DeployedCandidateOrderInfo[]> {
    return this.http.get<DeployedCandidateOrderInfo[]>('/api/OrderApplicants/overlappingorders', {
      params: { orderId, candidateProfileId, organizationId },
    });
  }
}
