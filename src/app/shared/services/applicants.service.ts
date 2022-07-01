import { Observable } from 'rxjs';

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ApplicantStatus } from '@shared/models/order-management.model';

@Injectable({ providedIn: 'root' })
export class ApplicantsService {
  public constructor(private readonly httpClient: HttpClient) {}

  public getApplicantsStatuses(): Observable<ApplicantStatus[]> {
    return this.httpClient.get<ApplicantStatus[]>('/api/Applicants/filterstatuses');
  }
}
