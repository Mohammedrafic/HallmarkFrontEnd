import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { CandidateList, CandidateListFilters, CandidateListRequest, EmployeeInactivateData, InactivateEmployeeDto, IRPCandidateList } from '../types/candidate-list.model';
import { AssignedSkillsByOrganization } from '@shared/models/skill.model';
import { CandidateStatus } from '@shared/enums/status';
import { ExportPayload } from '@shared/models/export.model';
import { sortByField } from '@shared/helpers/sort-by-field.helper';
import { sortBy } from '@shared/helpers/sort-array.helper';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CredentialType } from '@shared/models/credential-type.model';
import { CustomFormGroup } from '@core/interface';

@Injectable()
export class CandidateListService {
  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
  ) {}

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
   * Get IRP candidates (Employees)
   * @return list of IRP candidates in specific format
   */
     public exportIrp(payload: ExportPayload): Observable<Blob> {
      return this.http.post('/api/Employee/Export', payload, { responseType: 'blob' });
    }


  /**
   * Delete IRP candidate by id
   * @return list of IRP candidates
   */
  public deleteIRPCandidate(dto: InactivateEmployeeDto): Observable<void> {
    return this.http.delete<void>('/api/Employee/delete', {
      body: dto,
    });
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
  public getCredentialTypes(): Observable<CredentialType[]> {
    return this.http.get<CredentialType[]>('/api/CredentialTypes/all').pipe(map((data) => sortBy(data)));
  }

  public generateVMSCandidateFilterForm(): FormGroup {
    return new FormGroup({
      firstNamePattern: new FormControl(null),
      lastNamePattern: new FormControl(null),
      profileStatuses: new FormControl([]),
      regionsNames: new FormControl([]),
      skillsIds: new FormControl([]),
    });
  }

  public generateIRPCandidateFilterForm(): FormGroup {
    return new FormGroup({
      candidateId: new FormControl(null),
      firstNamePattern: new FormControl(null),
      lastNamePattern: new FormControl(null),
      profileStatuses: new FormControl([]),
      locationIds: new FormControl([]),
      departmentIds: new FormControl([]),
      primarySkillIds: new FormControl([]),
      secondarySkillIds: new FormControl([]),
      hireDate: new FormControl(null),
      startDate: new FormControl(null),
      endDate: new FormControl(null),
      credType : new FormControl([])
    });
  }

  public refreshFilters(isIRP: boolean, formGroup: FormGroup, filters: CandidateListFilters): void {
    formGroup.setValue(!isIRP ? {
      firstNamePattern: filters.firstNamePattern || '',
      lastNamePattern: filters.lastNamePattern || '',
      profileStatuses: filters.profileStatuses || [],
      regionsNames: filters.regionsNames || [],
      skillsIds: filters.skillsIds || [],
    } : {
      candidateId: filters.candidateId || '',
      firstNamePattern: filters.firstNamePattern || '',
      lastNamePattern: filters.lastNamePattern || '',
      profileStatuses: filters.profileStatuses || [],
      locationIds: filters.locationIds || [],
      departmentIds: filters.departmentIds || [],
      primarySkillIds: filters.primarySkillIds || [],
      secondarySkillIds: filters.secondarySkillIds || [],
      hireDate: filters.hireDate || null,
      startDate: filters.startDate || null,
      endDate: filters.endDate || null,
      credType: filters.credType || [],
    });
  }

  public createInactivateForm(): CustomFormGroup<EmployeeInactivateData> {
    return this.fb.group({
      inactivationDate: [null, Validators.required],
      inactivationReasonId: [null, Validators.required],
      createReplacement: [false],
      hireDate: [null],
    }) as CustomFormGroup<EmployeeInactivateData>;
  }
}
