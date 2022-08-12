import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CandidateList, CandidateListRequest } from '../types/candidate-list.model';
import { ListOfSkills } from '../../../models/skill.model';
import { CandidateStatus } from '../../../enums/status';
import { ExportPayload } from '../../../models/export.model';

@Injectable()
export class CandidateListService {
  constructor(private http: HttpClient) {}

  /**
   * Get candidates by page number
   * @return list of candidates
   */
  public getCandidates(payload: CandidateListRequest): Observable<CandidateList> {
    return this.http.post<CandidateList>('/api/CandidateProfile/profiles', payload);
  }

  /**
   * Get all skills for active business unit
   * @return list of skills
   */
  public getAllSkills(): Observable<ListOfSkills[]> {
    return this.http.get<ListOfSkills[]>('/api/MasterSkills/listByActiveBusinessUnit');
  }

  /**
   * Change candidate profile status
   */
  public changeCandidateStatus(candidateProfileId: number, profileStatus: CandidateStatus): Observable<any> {
    return this.http.post('/api/CandidateProfile/changestatus', { candidateProfileId, profileStatus });
  }

  /**
   * Export users list
   * @param payload
   */
  public export(payload: ExportPayload): Observable<Blob> {
    return this.http.post(`/api/CandidateProfile/export`, payload, { responseType: 'blob' });
  }
}
