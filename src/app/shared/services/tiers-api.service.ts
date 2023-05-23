import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { SystemType } from "@shared/enums/system-type.enum";
import { TierDTO } from '@shared/components/tiers-dialog/interfaces/tier-form.interface';
import { TiersPage } from '@shared/components/tiers-dialog/interfaces';
import { TierPriorityDTO } from '@organization-management/tiers/interfaces';
import { MasterCommitmentsPage } from '@shared/models/commitment.model';

@Injectable()
export class TiersApiService {
  constructor(private http: HttpClient) { }

  public getTiersByPage(pageNumber: number, pageSize: number, systemType: SystemType): Observable<TiersPage> {
    return this.http.get<TiersPage>('/api/OrganizationTiers', { params: { pageNumber, pageSize, systemType } });
  }

  public saveTier(payload: TierDTO): Observable<TierDTO> {
    return this.http.post<TierDTO>('/api/OrganizationTiers', payload);
  }

  public deleteTier(id: number): Observable<void> {
    return this.http.delete<void>(`/api/OrganizationTiers/${id}`);
  }

  public updateTierPriority(payload: TierPriorityDTO): Observable<TiersPage> {
    return this.http.post<TiersPage>('/api/OrganizationTiers/priority', payload);
  }

  public getMasterWorkCommitments(): Observable<MasterCommitmentsPage> {
    return this.http.post<MasterCommitmentsPage>(`/api/PayRates/MasterWorkCommitment/GetAll`, { pageNumber: 1, pageSize: 30 });
  }
}
