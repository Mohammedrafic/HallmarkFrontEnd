import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import {
  CandidateSchedules,
  EmployeesFilters,
  Schedule,
  ScheduleBookingErrors,
  ScheduleCandidatesPage,
  ScheduleFilters,
} from '../interface';
import { UnavailabilityReason } from '@shared/models/unavailability-reason.model';
import { OrganizationStructure } from '@shared/models/organization.model';
import { Skill } from '@shared/models/skill.model';
import * as ScheduleInt from '../interface';

@Injectable()
export class ScheduleApiService {
  constructor(private http: HttpClient) {
  }

  getScheduleEmployees(filters: ScheduleFilters | null = null): Observable<ScheduleCandidatesPage> {
    return this.http.post<ScheduleCandidatesPage>('/api/Schedules/employees', filters);
  }

  getSchedulesByEmployeesIds(
    employeeIds: number[],
    filters: EmployeesFilters,
  ): Observable<CandidateSchedules[]> {
    return this.http.post<CandidateSchedules[]>('/api/Schedules/byEmployeesIds', { employeeIds, ...filters });
  }

  getUnavailabilityReasons(visibleForIRPCandidates: boolean | null = null): Observable<UnavailabilityReason[]> {
    return this.http.post<UnavailabilityReason[]>(
      '/api/UnavailabilityReasons/forCurrentBusinessUnit',
      { visibleForIRPCandidates }
    );
  }

  createSchedule(employeeScheduledDays: Schedule): Observable<void> {
    return this.http.post<void>('/api/Schedules/create', employeeScheduledDays);
  }

  createBookSchedule(employeeBookDays: ScheduleInt.ScheduleBook):Observable<ScheduleBookingErrors[]> {
    return this.http.post<ScheduleBookingErrors[]>('/api/Schedules/book', employeeBookDays);
  }

  getEmployeesStructure(employeeId: number): Observable<OrganizationStructure> {
    return this.http.get<OrganizationStructure>(
      `/api/EmployeeFilterOptions/structuredDepartments`, { params: { EmployeeId: employeeId }}
    );
  }

  getSkillsByEmployees(employeeId: number, departmentId: number): Observable<Skill[]> {
    return this.http.get<Skill[]>('/api/EmployeeFilterOptions/skillsByDepartment', { params: {
        EmployeeId: employeeId,
        DepartmentId: departmentId,
      }});
  }
}
