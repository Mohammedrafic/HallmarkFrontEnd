import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Candidate, CandidatePage } from 'src/app/shared/models/candidate.model';
import { Education } from "src/app/shared/models/education.model";
import { Experience } from "src/app/shared/models/experience.model";

@Injectable({
  providedIn: 'root',
})
export class CandidateService {
  constructor(private http: HttpClient) {}

  /**
   * Get candidates by page number
   * @param pageNumber
   * @param pageSize
   * @return list of candidates
   */
  public getCandidates(pageNumber: number, pageSize: number): Observable<CandidatePage> {
    return this.http.get<CandidatePage>(`/api/CandidateProfile`, { params: { PageNumber: pageNumber, PageSize: pageSize }});
  }

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
    return candidate.id ? this.http.put<Candidate>(`/api/CandidateProfile`, candidate) : this.http.post<Candidate>(`/api/CandidateProfile`, candidate);
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
    return experience.id ?
      this.http.put<Experience>(`/api/Experience`, experience) :
      this.http.post<Experience>(`/api/Experience`, experience);
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
    return education.id ?
      this.http.put<Education>(`/api/Education`, education) :
      this.http.post<Education>(`/api/Education`, education);
  }

  /**
   * Remove Education
   * @param education
   */
  public removeEducation(education: Education): Observable<Education> {
    return this.http.delete<Education>(`/api/Education/${education.id}`);
  }
}
