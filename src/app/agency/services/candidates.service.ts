import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import {
  BulkVerifyCandidateCredential,
  CandidateCredential,
  CandidateCredentialResponse,
  CredentialGroupedFiles,
  CredentialRequestParams,
} from "@shared/models/candidate-credential.model";
import { CandidateImportRecord, CandidateImportResult } from "@shared/models/candidate-profile-import.model";
import { CredentialStatus } from "@shared/enums/status";
import { CredentialType } from "@shared/models/credential-type.model";
import { Credential } from "@shared/models/credential.model";
import { Candidate } from 'src/app/shared/models/candidate.model';
import { Education } from 'src/app/shared/models/education.model';
import { Experience } from 'src/app/shared/models/experience.model';

@Injectable({
  providedIn: 'root',
})
export class CandidateService {
  constructor(private http: HttpClient) {}

  public getCandidateById(id: number): Observable<Candidate> {
    return this.http.get<Candidate>(`/api/CandidateProfile/${id}`);
  }

  public saveCandidate(candidate: Candidate): Observable<Candidate> {
    return candidate.id
      ? this.http.put<Candidate>(`/api/CandidateProfile`, candidate)
      : this.http.post<Candidate>(`/api/CandidateProfile`, candidate);
  }

  public saveCandidatePhoto(file: Blob, candidateProfileId: number): Observable<any> {
    const formData = new FormData();
    formData.append('photo', file);
    return this.http.post(`/api/CandidateProfile/${candidateProfileId}/photo`, formData);
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
    return this.http.get<CandidateCredentialResponse>(
      `/api/CandidateCredentials/candidateProfileId/${id}`,
      { params: { ... params } }
    );
  }

  public getMasterCredentials(searchTerm: string, credentialTypeId: number | string): Observable<Credential[]> {
    return this.http.get<Credential[]>(`/api/MasterCredentials/forAgency`, {
      params: { SearchTerm: searchTerm, CredentialTypeId: credentialTypeId },
    });
  }

  public saveCredential(credential: CandidateCredential): Observable<CandidateCredential> {
    return credential.id
      ? this.http.put<CandidateCredential>(`/api/CandidateCredentials`, credential)
      : this.http.post<CandidateCredential>(`/api/CandidateCredentials`, credential);
  }
  public verifyCandidatesCredentials(credentials: BulkVerifyCandidateCredential): Observable<CandidateCredential[]> {
     return this.http.put<CandidateCredential[]>(`/api/CandidateCredentials/verifyCandidatesCredentials`, credentials);
  }

  public removeCredential(credential: CandidateCredential): Observable<CandidateCredential> {
    return this.http.delete<CandidateCredential>(`/api/CandidateCredentials/${credential.id}`);
  }

  public getCredentialTypes(): Observable<CredentialType[]> {
    return this.http.get<CredentialType[]>(`/api/CredentialTypes/all`);
  }

  public saveCredentialFiles(files: Blob[], candidateCredentialId: number): Observable<any> {
    const formData = new FormData();
    files.forEach((file) => formData.append('credentialFiles', file));
    return this.http.post(`/api/CandidateCredentials/${candidateCredentialId}/credentialFile`, formData);
  }

  public getCredentialFile(credentialFileId: number): Observable<any> {
    return this.http.get(`/api/CandidateCredentials/credentialFile/${credentialFileId}`, { responseType: 'blob' });
  }

  public getCredentialPdfFile(credentialFileId: number): Observable<any> {
    return this.http.get(`/api/CandidateCredentials/credentialPdfFile/${credentialFileId}`, { responseType: 'blob' });
  }

  public getCredentialGroupedFiles(candidateId: number): Observable<CredentialGroupedFiles[]> {
    return this.http.get<CredentialGroupedFiles[]>(
      `/api/CandidateCredentials/groupedCandidateCredentialsFiles/${candidateId}`
    );
  }

  public getCredentialStatuses(
    isOrganization: boolean,
    orderId: number | null,
    credentialStatus: CredentialStatus | null,
    credentialId: number | null
  ): Observable<CredentialStatus[]> {
    return this.http.post<CredentialStatus[]>(
      '/api/CandidateCredentials/credentialStatuses',
      { isOrganization, orderId, credentialStatus, credentialId}
    );
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
    return this.http.post(
      '/api/CandidateCredentials/bulkDownload',
      { candidateProfileId, candidateCredentialFileIds },
      { responseType: 'blob' }
    );
  }
}
