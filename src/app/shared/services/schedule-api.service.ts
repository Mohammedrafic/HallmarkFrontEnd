import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import {
  CandidateSchedules,
  ScheduleCandidatesPage,
  ScheduleFilters,
} from '../../modules/schedule/interface/schedule.model';

@Injectable()
export class ScheduleApiService {
  constructor(private http: HttpClient) {
  }

  getScheduleEmployees(filters: ScheduleFilters | null = null): Observable<ScheduleCandidatesPage> {
    return this.http.post<ScheduleCandidatesPage>('/api/Schedules/employees', filters);
  }

  getSchedulesByEmployeesIds(
    employeeIds: number[],
    filters: { startDate: string; endDate: string }
  ): Observable<CandidateSchedules[]> {
    return this.http.post<CandidateSchedules[]>('/api/Schedules/byEmployeesIds', { employeeIds, ...filters });
  }
}
