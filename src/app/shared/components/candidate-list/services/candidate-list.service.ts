import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { CandidateList, CandidateListFilters, CandidateListRequest, IRPCandidateList } from '../types/candidate-list.model';
import { AssignedSkillsByOrganization } from '../../../models/skill.model';
import { CandidateStatus } from '../../../enums/status';
import { ExportPayload } from '../../../models/export.model';
import { sortByField } from '@shared/helpers/sort-by-field.helper';
import { sortBy } from '@shared/helpers/sort-array.helper';
import { FormControl, FormGroup } from '@angular/forms';

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
   * Delete IRP candidate by id
   * @return list of IRP candidates
   */
  public deleteIRPCandidate(id: number): Observable<void> {
    return this.http.delete<void>(`/api/Employee/delete/${id}`);
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

  public generateVMSCandidateFilterForm(): FormGroup {
    return new FormGroup({
      candidateName: new FormControl(null),
      profileStatuses: new FormControl([]),
      regionsNames: new FormControl([]),
      skillsIds: new FormControl([]),
    });
  }

  public generateIRPCandidateFilterForm(): FormGroup {
    return new FormGroup({
      candidateId: new FormControl(null),
      candidateName: new FormControl(null),
      profileStatuses: new FormControl([]),
      locationIds: new FormControl([]),
      departmentIds: new FormControl([]),
      primarySkillIds: new FormControl([]),
      secondarySkillIds: new FormControl([]), 
      hireDate: new FormControl(null),
    });
  }

  public refreshFilters(isIRP: boolean, formGroup: FormGroup, filters: CandidateListFilters): void {
    formGroup.setValue(!isIRP ? {
      candidateName: filters.candidateName || '',
      profileStatuses: filters.profileStatuses || [],
      regionsNames: filters.regionsNames || [],
      skillsIds: filters.skillsIds || [],
    } : {
      candidateId: filters.candidateId || '',
      candidateName: filters.candidateName || '',
      profileStatuses: filters.profileStatuses || [],
      locationIds: filters.locationIds || [],
      departmentIds: filters.departmentIds || [],
      primarySkillIds: filters.primarySkillIds || [],
      secondarySkillIds: filters.secondarySkillIds || [],
      hireDate: filters.hireDate || null,
    });
  }
}
