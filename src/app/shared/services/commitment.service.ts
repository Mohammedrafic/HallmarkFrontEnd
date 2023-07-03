import { Observable } from 'rxjs';

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { MasterCommitment, MasterCommitmentsPage } from '@shared/models/commitment.model';

@Injectable({ providedIn: 'root' })
export class CommitmentService {
  public constructor(private readonly httpClient: HttpClient) {}

  public getMasterCommitments(pageNumber: number, pageSize: number): Observable<MasterCommitmentsPage> {
    return this.httpClient.post<MasterCommitmentsPage>('/api/MasterWorkCommitment/getAll', { pageNumber, pageSize });
  }

  public saveMasterCommitment(commitment: MasterCommitment): Observable<MasterCommitment> {
    if (commitment.id) {
      return this.httpClient.put<MasterCommitment>('/api/MasterWorkCommitment', { ...commitment });
    }
    return this.httpClient.post<MasterCommitment>('/api/MasterWorkCommitment', { ...commitment });
  }

  public removeMasterCommitment(id: number): Observable<void> {
    return this.httpClient.delete<void>('/api/MasterWorkCommitment', { params: { id } });
  }
}
