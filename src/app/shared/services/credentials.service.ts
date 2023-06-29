import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { map, Observable } from 'rxjs';

import { SystemType } from '@shared/enums/system-type.enum';
import { CredentialType } from '@shared/models/credential-type.model';
import {
  AssignedCredentialTreeData,
  Credential,
  CredentialFilter,
  CredentialFilterDataSources,
  CredentialPage
} from '@shared/models/credential.model';
import {
  CredentialSetupFilterDto,
  CredentialSetupGet,
  CredentialSetupMappingPost,
  CredentialSetupPage,
  CredentialSetupPost,
  SaveUpdatedCredentialSetupDetailIds,
} from '@shared/models/credential-setup.model';
import { ExportPayload } from '@shared/models/export.model';
import { IOrderCredential, IOrderCredentialItem } from '@order-credentials/types';

@Injectable({ providedIn: 'root' })
export class CredentialsService {

  constructor(private http: HttpClient) {}

  public getCredentialTypes(): Observable<CredentialType[]> {
    return this.http.get<CredentialType[]>(`/api/CredentialTypes/all`);
  }

  public getCredentialTypeById(credentialTypeId: number): Observable<CredentialType> {
    return this.http.get<CredentialType>(`/api/CredentialTypes/${credentialTypeId}`);
  }

  public saveUpdateCredentialType(credentialType: CredentialType): Observable<CredentialType> {
    return credentialType.id ?
      this.http.put<CredentialType>(`/api/CredentialTypes`, credentialType) :
      this.http.post<CredentialType>(`/api/CredentialTypes`, { names: [credentialType.name] });
  }

  public removeCredentialType(credentialType: CredentialType): Observable<any> {
    return this.http.delete<any>(`/api/CredentialTypes/${credentialType.id}`);
  }

  public getCredential(filters?: CredentialFilter): Observable<Credential[] | CredentialPage> {
    if (filters) {
      return this.http.post<CredentialPage>(`/api/MasterCredentials/filter`, filters);
    }
    return this.http.get<Credential[]>(`/api/MasterCredentials/all`);
  }

  public getCredentialForSettings(filters: CredentialFilter): Observable<CredentialPage> {
    return this.http.post<CredentialPage>('/api/MasterCredentials/assigned/filter', filters);
  }

  public saveUpdateCredential(credential: Credential): Observable<Credential> {
    return credential.id ?
      this.http.put<Credential>(`/api/MasterCredentials`, credential) :
      this.http.post<Credential>(`/api/MasterCredentials`, credential);
  }

  public removeCredential(credential: Credential): Observable<void> {
    return this.http.delete<void>(`/api/MasterCredentials/${credential.id}`);
  }

  public getCredentialSetupByMappingId(mappingId: number): Observable<CredentialSetupGet[]> {
    return this.http.get<CredentialSetupGet[]>(`/api/CredentialSetups?MappingId=${mappingId}&HideUnusedCredentials=true`);
  }

  public removeCredentialSetups(mappingId: number): Observable<void> {
    return this.http.delete<void>(`/api/CredentialSetups?MappingId=${mappingId}`);
  }

  public updateCredentialSetup(credentialSetup: CredentialSetupPost): Observable<CredentialSetupGet> {
    return this.http.post<CredentialSetupGet>(`/api/CredentialSetups`, credentialSetup);
  }

  public getAllCredentials(includeInIRP: boolean): Observable<Credential[]> {
    if (includeInIRP) {
      return this.http.get<Credential[]>(`/api/MasterCredentials/allCreds`, { params: { includeInIRP } });
    } else {
      return this.http.get<Credential[]>(`/api/MasterCredentials/allCreds`, { params: { includeInVMS: !includeInIRP} });
    }
  }

  public exportCredentialTypes(payload: ExportPayload): Observable<any> {
    if (payload.ids) {
      return this.http.post(`/api/CredentialTypes/export/byIds`, payload, { responseType: 'blob' });
    }
    return this.http.post(`/api/CredentialTypes/export`, payload, { responseType: 'blob' });
  }

  public getFilteredCredentialSetupData(filterData: CredentialSetupFilterDto): Observable<CredentialSetupPage> {
    return this.http.get<CredentialSetupPage>(
      `/api/CredentialSetups/mappings`,
      { params: filterData as HttpParams }
    );
  }

  public saveUpdateCredentialSetupMapping(
    credentialSetupMapping: CredentialSetupMappingPost
  ): Observable<SaveUpdatedCredentialSetupDetailIds> {
    return this.http.post<SaveUpdatedCredentialSetupDetailIds>(`/api/CredentialSetups/mappings`, credentialSetupMapping);
  }

  public getCredentialsDataSources(): Observable<CredentialFilterDataSources> {
    return this.http.get<CredentialFilterDataSources>(`/api/MasterCredentials/filteringOptions`);
  }

  public getPredefinedCredentials(
    departmentId: number,
    skillId: number,
    systemType: SystemType,
  ): Observable<IOrderCredentialItem[]> {
    const params = { departmentId, skillId, systemType };
    return this.http.get<IOrderCredential[]>(`/api/credentialsetups/predefined/forOrder`, { params })
      .pipe(map((credentials: IOrderCredential[]) => (credentials.map((credential: IOrderCredential) => ({
        credentialName: credential.name,
        credentialId: credential.masterCredentialId,
        credentialType: credential.credentialType,
        comment: credential.comments,
        reqForSubmission: credential.reqSubmission,
        reqForOnboard: credential.reqOnboard,
        optional: credential.isActive,
        isPredefined: credential.isPredefined,
      })))));
  }

  public getAssignedCredentialTreeData(): Observable<AssignedCredentialTreeData> {
    return this.http.get<AssignedCredentialTreeData>(`/api/MasterCredentials/assignedCredentialsTree`);
  }

  public saveAssignedCredentialValue(treeValue: number[]): Observable<number[]> {
    return this.http.put<number[]>(`/api/MasterCredentials/assignCredentials`, treeValue);
  }
}
