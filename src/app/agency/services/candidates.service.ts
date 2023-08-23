import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { map, Observable, of } from 'rxjs';

import {
  BulkVerifyCandidateCredential,
  CandidateCredential,
  CandidateCredentialResponse,
  CredentialGroupedFiles,
  CredentialRequestParams
} from '@shared/models/candidate-credential.model';
import { CandidateImportRecord, CandidateImportResult } from '@shared/models/candidate-profile-import.model';
import { CredentialStatus } from '@shared/enums/status';
import { CredentialType } from '@shared/models/credential-type.model';
import { Credential } from '@shared/models/credential.model';
import { Candidate } from 'src/app/shared/models/candidate.model';
import { Education } from 'src/app/shared/models/education.model';
import { Experience } from 'src/app/shared/models/experience.model';
import { AppState } from '../../store/app.state';
import { Store } from '@ngxs/store';
import { GetQueryParams } from '@core/helpers';

@Injectable({
  providedIn: 'root',
})
export class CandidateService {
  constructor(private http: HttpClient, private store: Store) {}

  public getCandidateById(id: number): Observable<Candidate> {
    return this.http.get<Candidate>(`/api/CandidateProfile/${id}`);
  }

  public saveCandidate(candidate: Candidate): Observable<Candidate> {
    return candidate.id
      ? this.http.put<Candidate>(`/api/CandidateProfile`, candidate)
      : this.http.post<Candidate>(`/api/CandidateProfile`, candidate);
  }

  public saveCandidatePhoto(file: Blob, candidateProfileId: number, isInitialUpload: boolean): Observable<null> {
    const formData = new FormData();
    formData.append('photo', file);
    return this.http.post<null>(
      `/api/CandidateProfile/${candidateProfileId}/photo${isInitialUpload ? '/true' : ''}`, formData);
  }

  public getCandidatePhoto(candidateProfileId: number): Observable<Blob> {
    return this.http.get(`/api/CandidateProfile/${candidateProfileId}/photo`, { responseType: 'blob' });
  }

  public removeCandidatePhoto(candidateProfileId: number): Observable<never> {
    return this.http.delete<never>(`/api/CandidateProfile/${candidateProfileId}/photo`);
  }

  public getExperienceByCandidateId(id: number): Observable<Experience[]> {
    return this.http.get<Experience[]>(`/api/Experience/candidateProfile/${id}`);
  }

  public saveExperience(experience: Experience): Observable<Experience> {
    return experience.id
      ? this.http.put<Experience>(`/api/Experience`, experience)
      : this.http.post<Experience>(`/api/Experience`, experience);
  }

  public removeExperience(experience: Experience): Observable<Experience> {
    return this.http.delete<Experience>(`/api/Experience/${experience.id}`);
  }

  public getEducationByCandidateId(id: number): Observable<Education[]> {
    return this.http.get<Education[]>(`/api/Education/candidateProfile/${id}`);
  }

  public saveEducation(education: Education): Observable<Education> {
    return education.id
      ? this.http.put<Education>(`/api/Education`, education)
      : this.http.post<Education>(`/api/Education`, education);
  }

  public removeEducation(education: Education): Observable<Education> {
    return this.http.delete<Education>(`/api/Education/${education.id}`);
  }

  public getCredentialByCandidateId(params: CredentialRequestParams, id: number): Observable<CandidateCredentialResponse> {
    const { isAgencyArea } = this.store.selectSnapshot(AppState.isOrganizationAgencyArea);
    const endpoint = new Map<boolean, string>([
      [true, `/api/CandidateCredentials/candidateProfileId/${id}`],
      [false, `/api/EmployeeCredentials/all`],
    ]);

    return this.http.get<CandidateCredentialResponse>(
      endpoint.get(isAgencyArea) as string,
      { params: { ... params } }
    ).pipe(map((res: any) => {
      if (isAgencyArea) {
        return res;
      } else {
        return {
          credentials: {
          ...res,
            items: res.items.map((item: any) => {
              return {
                ...item,
                credentialFiles: item.files,
                createdUntil: item.certifiedUntil,
                createdOn: item.certifiedOn,
                masterName: item.credential,
                number: item.credentialNumber,
              };
            }),
          }};
      }
    }));
  }

  public getMasterCredentials(searchTerm: string, credentialTypeId: number | string,
    orderId: number | null): Observable<Credential[]> {
    const { isAgencyArea } = this.store.selectSnapshot(AppState.isOrganizationAgencyArea);

    const endpoint = new Map<boolean, string>([
      [true, '/api/MasterCredentials/forAgency'],
      [false, '/api/MasterCredentials'],
    ]);

    const params = {
      ...searchTerm ? { SearchTerm: searchTerm } : {},
      ...credentialTypeId ? { CredentialTypeId: credentialTypeId } : {},
      ...orderId ? { OrderId: orderId } : {},
    };

    return this.http.get<Credential[]>(endpoint.get(isAgencyArea) as string, {
      params: GetQueryParams(params),
    });
  }

  public getIRPMasterCredentials(searchTerm: string, credentialTypeId: number | string,
    orderId: number | null): Observable<Credential[]> {
      const params = {
        ...searchTerm ? { SearchTerm: searchTerm } : {},
        ...credentialTypeId ? { CredentialTypeId: credentialTypeId } : {},
        ...orderId ? { OrderId: orderId } : {},
      };

      return this.http.get<Credential[]>('/api/MasterCredentials/forIrp', {
        params: GetQueryParams(params),
      }); 
    }

  public saveCredential(credential: CandidateCredential, file: Blob | null): Observable<CandidateCredential> {
    const { isAgencyArea } = this.store.selectSnapshot(AppState.isOrganizationAgencyArea);
    const endpoint = new Map<boolean, string>([
      [true, '/api/CandidateCredentials'],
      [false, '/api/EmployeeCredentials'],
    ]);
    const formData = new FormData();
    if (file) {
      formData.append('files', file);
    }
    for (const key in credential) {
      formData.append(key, credential[key as keyof CandidateCredential]?.toString() || '');
    }
    return this.http[credential.id ? 'put' : 'post']<CandidateCredential>(endpoint.get(isAgencyArea) as string, formData);
  }

  public verifyCandidatesCredentials(credentials: BulkVerifyCandidateCredential): Observable<CandidateCredential[]> {
     return this.http.put<CandidateCredential[]>(`/api/CandidateCredentials/verifyCandidatesCredentials`, credentials);
  }

  public removeCredential(credential: CandidateCredential): Observable<CandidateCredential> {
    const { isAgencyArea } = this.store.selectSnapshot(AppState.isOrganizationAgencyArea);
    const endpoint = new Map<boolean, string>([
      [true, `/api/CandidateCredentials/${credential.id}`],
      [false, `/api/EmployeeCredentials/${credential.id}`],
    ]);
    return this.http.delete<CandidateCredential>(endpoint.get(isAgencyArea) as string);
  }

  public getCredentialTypes(): Observable<CredentialType[]> {
    return this.http.get<CredentialType[]>(`/api/CredentialTypes/all`);
  }

  public saveCredentialFiles(files: Blob[], candidateCredentialId: number): Observable<any> {
    const { isAgencyArea } = this.store.selectSnapshot(AppState.isOrganizationAgencyArea);
    const endpoint = new Map<boolean, string>([
      [true, `/api/CandidateCredentials/${candidateCredentialId}/credentialFile`],
      [false, `/api/EmployeeCredentials/${candidateCredentialId}/credentialFile`],
    ]);

    const formData = new FormData();
    files.forEach((file) => formData.append('credentialFiles', file));
    return this.http.post(endpoint.get(isAgencyArea) as string, formData);
  }

  public getCredentialFile(credentialFileId: number): Observable<any> {
    const { isAgencyArea } = this.store.selectSnapshot(AppState.isOrganizationAgencyArea);
    const endpoint = new Map<boolean, string>([
      [true, `/api/CandidateCredentials/credentialFile/${credentialFileId}`],
      [false, `/api/EmployeeCredentials/credentialFile/${credentialFileId}`],
    ]);

    return this.http.get(endpoint.get(isAgencyArea) as string, { responseType: 'blob' });
  }

  public getCredentialPdfFile(credentialFileId: number): Observable<any> {
    const { isAgencyArea } = this.store.selectSnapshot(AppState.isOrganizationAgencyArea);
    const endpoint = new Map<boolean, string>([
      [true, `/api/CandidateCredentials/credentialPdfFile/${credentialFileId}`],
      [false, `/api/EmployeeCredentials/credentialPdfFile/${credentialFileId}`],
    ]);

    return this.http.get(endpoint.get(isAgencyArea) as string, { responseType: 'blob' });
  }

  public getCredentialGroupedFiles(candidateId: number): Observable<CredentialGroupedFiles[]> {
    const { isAgencyArea } = this.store.selectSnapshot(AppState.isOrganizationAgencyArea);
    const endpoint = new Map<boolean, string>([
      [true, `/api/CandidateCredentials/groupedCandidateCredentialsFiles/${candidateId}`],
      [false, `/api/EmployeeCredentials/groupedCandidateCredentialsFiles/${candidateId}`],
    ]);

    return this.http.get<CredentialGroupedFiles[]>(endpoint.get(isAgencyArea) as string);
  }

  public getCredentialStatuses(
    isOrganization: boolean,
    orderId: number | null,
    credentialStatus: CredentialStatus | null,
    credentialId: number | null
  ): Observable<CredentialStatus[]> {
    const { isAgencyArea } = this.store.selectSnapshot(AppState.isOrganizationAgencyArea);
    if (isAgencyArea) {
      return this.http.post<CredentialStatus[]>(
        '/api/CandidateCredentials/credentialStatuses',
        { isOrganization, orderId, credentialStatus, credentialId}
      );
    } else {
      const statuses = Object.values(CredentialStatus).filter((v) => !isNaN(Number(v)));
      return of(statuses) as Observable<CredentialStatus[]>;
    }

  }

  public getCandidateProfileTemplate(): Observable<any> {
    return this.http.post('/api/CandidateProfile/template', [],{ responseType: 'blob' });
  }

  public getCandidateProfileErrors(errorRecords: CandidateImportRecord[]): Observable<any> {
    return this.http.post('/api/CandidateProfile/template', errorRecords, { responseType: 'blob' });
  }

  public uploadCandidateProfileFile(file: Blob): Observable<CandidateImportResult> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<CandidateImportResult>('/api/CandidateProfile/import', formData);
  }

  public saveCandidateImportResult(successfullRecords: CandidateImportRecord[]): Observable<CandidateImportResult> {
    return this.http.post<CandidateImportResult>('/api/CandidateProfile/saveimport', successfullRecords);
  }

  public downloadCredentialFiles(candidateProfileId: number, candidateCredentialFileIds: number[]): Observable<Blob> {
    const { isAgencyArea } = this.store.selectSnapshot(AppState.isOrganizationAgencyArea);
    const endpoint = new Map<boolean, string>([
      [true, '/api/CandidateCredentials/bulkDownload'],
      [false, '/api/EmployeeCredentials/bulkDownload'],
    ]);

    return this.http.post(
      endpoint.get(isAgencyArea) as string,
      { candidateProfileId, candidateCredentialFileIds },
      { responseType: 'blob' }
    );
  }

  public getMissingCredentials(candidateProfileId: number): Observable<void> {
    return this.http.post<void>('/api/EmployeeCredentials/addMissingCredentials', { candidateProfileId });
  }
}
