import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { Schedule } from 'src/app/modules/schedule/components/create-schedule/create-schedule.interface';
import { UnavailabilityReason } from '@shared/models/unavailability-reason.model';

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

  getUnavailabilityReasons(visibleForIRPCandidates: boolean): Observable<UnavailabilityReason[]> {
    return this.http.post<UnavailabilityReason[]>(
      '/api/UnavailabilityReasons/forCurrentBusinessUnit',
      { visibleForIRPCandidates }
    );
  }

  createSchedule(employeeScheduledDays: Schedule): Observable<void> {
    return this.http.post<void>('/api/Schedules/create', employeeScheduledDays);
  }
}
