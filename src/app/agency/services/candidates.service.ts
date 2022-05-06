import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Candidate } from 'src/app/shared/models/candidate.model';

@Injectable({
  providedIn: 'root',
})
export class CandidateService {
  constructor(private http: HttpClient) {}

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
}
