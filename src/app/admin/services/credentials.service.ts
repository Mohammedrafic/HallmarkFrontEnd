import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { CredentialType } from '../../shared/models/credential-type.model';
import { Credential } from '../../shared/models/credential.model';

@Injectable({ providedIn: 'root' })
export class CredentialsService {

  constructor(private http: HttpClient) { }

  /**
   * Get credential types
   * @return list of credential types
   */
  public getCredentialTypes(): Observable<CredentialType[]> { // TODO: correct after BE implementation
    return this.http.get<CredentialType[]>(`/api/CredentialTypes`);
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
      this.http.post<CredentialType>(`/api/CredentialTypes`, credentialType);
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
  public getCredential(): Observable<Credential[]> { // TODO: correct after BE implementation
    return this.http.get<Credential[]>(`/api/Credential`);
  }

  /**
   * Create or update credential
   * @param credential object to save
   * @return Created/Updated credential
   */
  public saveUpdateCredential(credential: Credential): Observable<Credential> {
    return credential.id ?
      this.http.put<Credential>(`/api/Credential`, credential) :
      this.http.post<Credential>(`/api/Credential`, credential);
  }

  /**
   * Remove credential by its id
   * @param credential
   */
  public removeCredential(credential: Credential): Observable<any> {
    return this.http.delete<CredentialType>(`/api/Credential/${credential.id}`);
  }
}
