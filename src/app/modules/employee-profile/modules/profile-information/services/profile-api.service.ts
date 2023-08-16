import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { GetQueryParams } from '@core/helpers';
import { SystemType } from '@shared/enums/system-type.enum';

import { AssignedSkillDTO, EmployeeDTO } from '../interfaces';

@Injectable()
export class ProfileApiService {

  constructor(private http: HttpClient) {}

  getEmployee(id: number): Observable<EmployeeDTO> {
    return this.http.get<EmployeeDTO>(`/api/Employee/${id}`);
  }

  getAssignedSkills(systemType = SystemType.IRP): Observable<AssignedSkillDTO[]> {
    const params = { systemType };
    return this.http.get<AssignedSkillDTO[]>(
      `/api/AssignedSkills/assignedSkillsForCurrentBusinessUnit`,
      { params: GetQueryParams(params) }
    );
  }

  getStates(): Observable<string[]> {
    return this.http.get<string[]>('/api/Regions/UsaCanadaStates');
  }

  getEmployeePhoto(id: number): Observable<Blob> {
    const salt = (new Date).getTime();
    return this.http.get(`/api/employee/${id}/photo`, { params: { salt }, responseType: 'blob' });
  }
}
