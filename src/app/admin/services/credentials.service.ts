import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { CredentialType } from '../../shared/models/credential-type.model';
import { Credential } from '../../shared/models/credential.model';
import { CredentialSetup } from '../../shared/models/credential-setup.model';

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
    return this.http.delete<CredentialType>(`/api/CredentialTypes/${credentialType.id}`);
  }

  /**
   * Get credential list
   * @return list of credentials
   */
  public getCredential(businessUnitId: number | undefined): Observable<Credential[]> {
    return this.http.get<Credential[]>(`/api/MasterCredentials/businessUnitId/${businessUnitId}`);
  }

  /**
   * Create credential
   * @param credential object to save
   * @return Created credential in array
   */
  public saveCredential(credential: Credential): Observable<Credential> {
    return this.http.post<Credential>(`/api/MasterCredentials`, credential);
  }

  /**
   * Update credential
   * @param credential object to update
   * @return Updated credential
   */
  public updateCredential(credential: Credential): Observable<Credential> {
    return this.http.put<Credential>(`/api/MasterCredentials`, credential);
  }

  /**
   * Remove credential by its id
   * @param credential
   */
  public removeCredential(credential: Credential): Observable<any> {
    return this.http.delete<any>(`/api/MasterCredentials/${credential.id}`);
  }

  /**
   * Get credential setup list
   * @param businessUnitId object to search by
   * @return list of credential setup
   */
  public getCredentialSetup(businessUnitId: number | undefined): Observable<CredentialSetup[]> {
    return this.http.get<CredentialSetup[]>(`/api/CredentialSetup/businessUnitId/${businessUnitId}`);
  }

  /**
   * Create/Update credential setup
   * @param credentialSetup object to save
   * @return Created/Updated credential setup
   */
  public saveUpdateCredentialSetup(credentialSetup: CredentialSetup): Observable<CredentialSetup> {
    if (credentialSetup.id) {
      return this.http.put<CredentialSetup>(`/api/CredentialSetup`, credentialSetup);
    } else {
      return this.http.post<CredentialSetup>(`/api/CredentialSetup`, credentialSetup);
    }
  }
}
