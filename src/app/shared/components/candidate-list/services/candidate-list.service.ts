import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { CandidateList, CandidateListRequest, IRPCandidateList } from '../types/candidate-list.model';
import { AssignedSkillsByOrganization } from '../../../models/skill.model';
import { CandidateStatus } from '../../../enums/status';
import { ExportPayload } from '../../../models/export.model';
import { sortByField } from '@shared/helpers/sort-by-field.helper';
import { sortBy } from '@shared/helpers/sort-array.helper';

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
   * Get IRP candidates (Employees) by page number
   * @return list of IRP candidates
   */
  public getIRPCandidates(payload: CandidateListRequest): Observable<IRPCandidateList> {
    return this.http.post<IRPCandidateList>('/api/Employee/GetAll', payload);
  }

  /**
   * Get all skills for active business unit
   * @return list of skills
   */
  public getAllSkills(): Observable<AssignedSkillsByOrganization[]> {
    return this.http
      .get<AssignedSkillsByOrganization[]>('/api/AssignedSkills/assignedSkillsForCurrentBusinessUnit')
      .pipe(map((data) => sortByField(data, 'skillDescription')));
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

  public getRegions(): Observable<string[]> {
    return this.http.get<string[]>('/api/Regions/UsaCanadaStates').pipe(map((data) => sortBy(data)));
  }
}
