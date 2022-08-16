import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { CandidateCredential, CandidateCredentialPage, CredentialGroupedFiles } from "@shared/models/candidate-credential.model";
import { CandidateImportRecord, CandidateImportResult } from "@shared/models/candidate-profile-import.model";
import { CredentialType } from "@shared/models/credential-type.model";
import { Credential } from "@shared/models/credential.model";
import { Observable } from 'rxjs';
import { Candidate } from 'src/app/shared/models/candidate.model';
import { Education } from 'src/app/shared/models/education.model';
import { Experience } from 'src/app/shared/models/experience.model';

@Injectable({
  providedIn: 'root',
})
export class CandidateService {
  constructor(private http: HttpClient) {}

  /**
   * Get Candidate by id
   * @param id
   * @return specific Candidate
   */
  public getCandidateById(id: number): Observable<Candidate> {
    return this.http.get<Candidate>(`/api/CandidateProfile/${id}`);
  }

  /**
   * Create or update candidate
   * @param candidate object to save
   * @return Created/Updated candidate
   */
  public saveCandidate(candidate: Candidate): Observable<Candidate> {
    return candidate.id
      ? this.http.put<Candidate>(`/api/CandidateProfile`, candidate)
      : this.http.post<Candidate>(`/api/CandidateProfile`, candidate);
  }

  /**
   * Save candidate profile photo in blob storage
   * @return
   */
  public saveCandidatePhoto(file: Blob, candidateProfileId: number): Observable<any> {
    const formData = new FormData();
    formData.append('photo', file);
    return this.http.post(`/api/CandidateProfile/${candidateProfileId}/photo`, formData);
  }

  /**
   * Get candidate profile photo from blob storage
   * @return blob
   */
  public getCandidatePhoto(candidateProfileId: number): Observable<Blob> {
    return this.http.get(`/api/CandidateProfile/${candidateProfileId}/photo`, { responseType: 'blob' });
  }

  /**
   * Remove photo
   * @param candidateProfileId
   */
  public removeCandidatePhoto(candidateProfileId: number): Observable<never> {
    return this.http.delete<never>(`/api/CandidateProfile/${candidateProfileId}/photo`);
  }

  /**
   * Get experiences by id
   * @param id
   * @return list experiences
   */
  public getExperienceByCandidateId(id: number): Observable<Experience[]> {
    return this.http.get<Experience[]>(`/api/Experience/candidateProfile/${id}`);
  }

  /**
   * Create or update Experience
   * @param experience object to save
   * @return Created/Updated Experience
   */
  public saveExperience(experience: Experience): Observable<Experience> {
    return experience.id
      ? this.http.put<Experience>(`/api/Experience`, experience)
      : this.http.post<Experience>(`/api/Experience`, experience);
  }

  /**
   * Remove Experience
   * @param experience
   */
  public removeExperience(experience: Experience): Observable<Experience> {
    return this.http.delete<Experience>(`/api/Experience/${experience.id}`);
  }

  /**
   * Get educations by id
   * @param id
   * @return list educations
   */
  public getEducationByCandidateId(id: number): Observable<Education[]> {
    return this.http.get<Education[]>(`/api/Education/candidateProfile/${id}`);
  }

  /**
   * Create or update Education
   * @param education object to save
   * @return Created/Updated Education
   */
  public saveEducation(education: Education): Observable<Education> {
    return education.id
      ? this.http.put<Education>(`/api/Education`, education)
      : this.http.post<Education>(`/api/Education`, education);
  }

  /**
   * Remove Education
   * @param education
   */
  public removeEducation(education: Education): Observable<Education> {
    return this.http.delete<Education>(`/api/Education/${education.id}`);
  }

  /**
   * Get candidates credential by page number
   * @param pageNumber
   * @param pageSize
   * @param id
   * @return list of candidates credential
   */
  public getCredentialByCandidateId(
    pageNumber: number,
    pageSize: number,
    id: number
  ): Observable<CandidateCredentialPage> {
    return this.http.get<CandidateCredentialPage>(`/api/CandidateCredentials/candidateProfileId/${id}`, {
      params: { PageNumber: pageNumber, PageSize: pageSize },
    });
  }

  /**
   * Get Master Credentials by searchTerm and credentialTypeId
   * @param searchTerm
   * @param credentialTypeId
   * @return list of candidates credential
   */
  public getMasterCredentials(searchTerm: string, credentialTypeId: number | string): Observable<Credential[]> {
    return this.http.get<Credential[]>(`/api/MasterCredentials/forAgency`, {
      params: { SearchTerm: searchTerm, CredentialTypeId: credentialTypeId },
    });
  }

  /**
   * Create or update CandidateCredential
   * @param credential object to save
   * @return Created/Updated CandidateCredential
   */
  public saveCredential(credential: CandidateCredential): Observable<CandidateCredential> {
    return credential.id
      ? this.http.put<CandidateCredential>(`/api/CandidateCredentials`, credential)
      : this.http.post<CandidateCredential>(`/api/CandidateCredentials`, credential);
  }

  /**
   * Remove CandidateCredential
   * @param credential
   */
  public removeCredential(credential: CandidateCredential): Observable<CandidateCredential> {
    return this.http.delete<CandidateCredential>(`/api/CandidateCredentials/${credential.id}`);
  }

  /**
   * Get credential types
   * @return list of credential types
   */
  public getCredentialTypes(): Observable<CredentialType[]> {
    return this.http.get<CredentialType[]>(`/api/CredentialTypes/all`);
  }

  /**
   * Save credential files in blob storage
   * @return
   */
  public saveCredentialFiles(files: Blob[], candidateCredentialId: number): Observable<any> {
    const formData = new FormData();
    files.forEach((file) => formData.append('credentialFiles', file));
    return this.http.post(`/api/CandidateCredentials/${candidateCredentialId}/credentialFile`, formData);
  }

  /**
   * Get credential files from blob storage
   * @return blob
   */
  public getCredentialFile(credentialFileId: number): Observable<any> {
    return this.http.get(`/api/CandidateCredentials/credentialFile/${credentialFileId}`, { responseType: 'blob' });
  }

  /**
   * Get credential files from blob storage in pdf format
   * @return blob
   */
  public getCredentialPdfFile(credentialFileId: number): Observable<any> {
    return this.http.get(`/api/CandidateCredentials/credentialPdfFile/${credentialFileId}`, { responseType: 'blob' });
  }

  /**
   * Get Credential Grouped Files by candidate id
   * @return CredentialGroupedFiles array
   */
  public getCredentialGroupedFiles(candidateId: number): Observable<CredentialGroupedFiles[]> {
    return this.http.get<CredentialGroupedFiles[]>(
      `/api/CandidateCredentials/groupedCandidateCredentialsFiles/${candidateId}`
    );
  }

  /**
   * Get Candidate Profile Template
   * @return blob
   */
  public getCandidateProfileTemplate(): Observable<any> {
    return this.http.post('/api/CandidateProfile/template', [],{ responseType: 'blob' });
  }

  /**
   * Get Candidate Profile Errors
   * @return blob
   */
  public getCandidateProfileErrors(errorRecords: CandidateImportRecord[]): Observable<any> {
    return this.http.post('/api/CandidateProfile/template', errorRecords, { responseType: 'blob' });
  }

  /**
   * Upload Candidate Profile File
   * @return CandidateImportResult
   */
  public uploadCandidateProfileFile(file: Blob): Observable<CandidateImportResult> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<CandidateImportResult>('/api/CandidateProfile/import', formData);
  }

  public saveCandidateImportResult(successfullRecords: CandidateImportRecord[]): Observable<CandidateImportResult> {
    return this.http.post<CandidateImportResult>('/api/CandidateProfile/saveimport', successfullRecords);
  }
}
