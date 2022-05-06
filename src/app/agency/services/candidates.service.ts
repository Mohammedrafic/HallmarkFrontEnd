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
}
