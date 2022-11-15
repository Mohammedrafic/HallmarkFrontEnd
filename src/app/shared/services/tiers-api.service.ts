import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { TierDTO } from '@shared/components/tiers-dialog/interfaces/tier-form.interface';
import { TiersPage } from '@shared/components/tiers-dialog/interfaces';

@Injectable()
export class TiersApiService {
  constructor(private http: HttpClient) { }

  public getTiersByPage(pageNumber: number, pageSize: number): Observable<TiersPage> {
    return this.http.get<TiersPage>('/api/OrganizationTiers', { params: { PageNumber: pageNumber, PageSize: pageSize }})
  }

  public saveTier(payload: TierDTO): Observable<TierDTO> {
    return this.http.post<TierDTO>('/api/OrganizationTiers', payload);
  }

  public deleteTier(id: number): Observable<void> {
    return this.http.delete<void>(`/api/OrganizationTiers/${id}`);
  }
}
