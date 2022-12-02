import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { ExportPayload } from '@shared/models/export.model';

@Injectable()
export class CredentialListApiService {
  constructor(private http: HttpClient) {}
  public exportCredentialTypes(payload: ExportPayload, isCredentialSettings: boolean): Observable<Blob> {
    return this.http.post(
      isCredentialSettings ?
        '/api/MasterCredentials/assigned/export' : '/api/MasterCredentials/export',
      payload, { responseType: 'blob' });
  }
}
