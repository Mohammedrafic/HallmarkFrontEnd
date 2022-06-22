import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { CredentialType } from '@shared/models/credential-type.model';
import { Credential } from '@shared/models/credential.model';
import {
  CredentialSetupFilterGet,
  CredentialSetupFilterDto,
  CredentialSetupGet,
  CredentialSetupPost
} from '@shared/models/credential-setup.model';
import { ExportPayload } from '@shared/models/export.model';

@Injectable({ providedIn: 'root' })
export class CredentialsService {

  constructor(private http: HttpClient) { }

  /**
   * Get credential types
   * @return list of credential types
   */
  public getCredentialTypes(): Observable<CredentialType[]> {
    return this.http.get<CredentialType[]>(`/api/CredentialTypes/all`);
  }

  /**
   * Get credential type by its id
   * @return list of credential types
   */
  public getCredentialTypeById(credentialTypeId: number): Observable<CredentialType> {
    return this.http.get<CredentialType>(`/api/CredentialTypes/${credentialTypeId}`);
  }

  /**
   * Create or update credential type
   * @param credentialType object to save
   * @return Created/Updated credentialType
   */
  public saveUpdateCredentialType(credentialType: CredentialType): Observable<CredentialType> {
    return credentialType.id ?
      this.http.put<CredentialType>(`/api/CredentialTypes`, credentialType) :
      this.http.post<CredentialType>(`/api/CredentialTypes`, { names: [credentialType.name]});
  }

  /**
   * Remove credential type by its id
   * @param credentialType
   */
  public removeCredentialType(credentialType: CredentialType): Observable<any> {
    return this.http.delete<any>(`/api/CredentialTypes/${credentialType.id}`);
  }

  /**
   * Get credential list
   * @return list of credentials
   */
  public getCredential(): Observable<Credential[]> {
    return this.http.get<Credential[]>(`/api/MasterCredentials/all`);
  }

  /**
   * Create credential
   * @param credential object to save
   * @return Created credential in array
   */
  public saveUpdateCredential(credential: Credential): Observable<Credential> {
    return credential.id ?
      this.http.put<Credential>(`/api/MasterCredentials`, credential) :
      this.http.post<Credential>(`/api/MasterCredentials`, credential);
  }

  /**
   * Remove credential by its id
   * @param credential
   */
  public removeCredential(credential: Credential): Observable<any> {
    return this.http.delete<any>(`/api/MasterCredentials/${credential.id}`);
  }

  /**
   * Get credential setup list by mappingId
   * @param mappingId
   * @return list of credential setup
   */
  public getCredentialSetupByMappingId(mappingId: number): Observable<CredentialSetupGet[]> {
    return this.http.get<CredentialSetupGet[]>(`/api/CredentialSetups/${mappingId}`);
  }

  /**
   * Remove credential setup record by its id
   * @param mappingId
   */
  public removeCredentialSetups(mappingId: number): Observable<void> {
    return this.http.delete<void>(`/api/CredentialSetups/${mappingId}`);
  }

  /**
   * Update credential setup
   * @param credentialSetup object to save
   * @return Updated credential setup
   */
  public updateCredentialSetup(credentialSetup: CredentialSetupPost): Observable<CredentialSetupGet> {
    return this.http.post<CredentialSetupGet>(`/api/CredentialSetup`, credentialSetup);
  }

  /**
   * Get credential list
   * @return list of credentials
   */
  public getAllCredentials(): Observable<Credential[]> {
    return this.http.get<Credential[]>(`/api/MasterCredentials/allCreds`);
  }

 /**
  * Export credential types
  */
  public exportCredentialTypes(payload: ExportPayload): Observable<any> {
    if (payload.ids) {
      return this.http.post(`/api/CredentialTypes/export/byIds`, payload, { responseType: 'blob' });
    }
    return this.http.post(`/api/CredentialTypes/export`, payload, { responseType: 'blob' });
  }

  /**
   * Get Filtered Credential Setup Mapping Data
   * @param filterData filter object
   * @return list of Credential Setup Mapping Filter Data
   */
  public getFilteredCredentialSetupData(filterData: CredentialSetupFilterDto): Observable<CredentialSetupFilterGet[]> {
    let data = '?';
    const keysValues: string[] = [];

    Object.entries(filterData).forEach(([key, value]) => {
      if (value) {
        keysValues.push(`${key}=${value}`)
      }
    });

    data += keysValues.join('&');
    return this.http.get<CredentialSetupFilterGet[]>(`/api/CredentialSetups/mappings${data}`);
  }
}
