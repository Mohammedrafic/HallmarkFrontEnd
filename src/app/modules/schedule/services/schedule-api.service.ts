import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { DateTimeHelper } from '@core/helpers';
import { OrganizationStructure } from '@shared/models/organization.model';
import { Skill } from '@shared/models/skill.model';
import { UnavailabilityReason } from '@shared/models/unavailability-reason.model';
import {
  BookingsOverlapsRequest,
  BookingsOverlapsResponse,
} from '../components/replacement-order-dialog/replacement-order.interface';
import { ScheduleType } from 'src/app/modules/schedule/enums';
import { ScheduledShift } from '../components/edit-schedule/edit-schedule.interface';
import * as ScheduleInt from '../interface';
import {
  CandidateSchedules,
  DeleteScheduleRequest,
  EmployeesFilters,
  OpenPositionParams,
  OpenPositionsList,
  Schedule,
  ScheduleBookingErrors,
  ScheduleCandidatesPage,
  ScheduleExport,
  ScheduleFilters,
} from '../interface';

@Injectable()
export class ScheduleApiService {
  constructor(private http: HttpClient) {}

  getScheduleEmployees(filters: ScheduleFilters | null = null): Observable<ScheduleCandidatesPage> {
    return this.http.post<ScheduleCandidatesPage>('/api/Schedules/employees', filters);
  }

  getSchedulesByEmployeesIds(
    employeeIds: number[],
    filters: EmployeesFilters,
  ): Observable<CandidateSchedules[]> {
    return this.http.post<CandidateSchedules[]>('/api/Schedules/byEmployeesIds?api-version=2', { employeeIds, ...filters });
  }

  getUnavailabilityReasons(visibleForIRPCandidates: boolean | null = null): Observable<UnavailabilityReason[]> {
    return this.http.post<UnavailabilityReason[]>(
      '/api/UnavailabilityReasons/forCurrentBusinessUnit',
      { visibleForIRPCandidates }
    );
  }

  createSchedule(employeeScheduledDays: Schedule): Observable<void> {
    const userLocalTime = DateTimeHelper.setUtcTimeZone(new Date());
    return this.http.post<void>('/api/Schedules/create', {...employeeScheduledDays, userLocalTime });
  }

  createBookSchedule(
    employeeBookDays: ScheduleInt.ScheduleBook,
    isSingleError = true
  ):Observable<ScheduleBookingErrors[]> {
    employeeBookDays.isSingleError = isSingleError;
    return this.http.post<ScheduleBookingErrors[]>('/api/Schedules/book', employeeBookDays);
  }

  getEmployeesStructure(employeeId: number): Observable<OrganizationStructure> {
    return this.http.get<OrganizationStructure>(
      `/api/EmployeeFilterOptions/structuredDepartments`, { params: { EmployeeId: employeeId }}
    );
  }

  getSkillsByEmployees(departmentIds: number[], employeeId?: number): Observable<Skill[]> {
    const byEmployeesId = { employeeId, departmentIds };
    const byDepartmentId = { departmentIds };

    return this.http.post<Skill[]>(
      '/api/EmployeeFilterOptions/skillsByDepartment',
      employeeId ? byEmployeesId : byDepartmentId
    );
  }

  updateScheduledShift(scheduledShift: ScheduledShift, type: ScheduleType):Observable<void> {
    const userLocalTime = DateTimeHelper.setUtcTimeZone(new Date());
    return this.http.post<void>(
      type === ScheduleType.Book ? '/api/Schedules/booking/update' : '/api/Schedules/schedule/update',
      { ...scheduledShift, userLocalTime },
    );
  }

  checkBookingsOverlaps(request: BookingsOverlapsRequest):Observable<BookingsOverlapsResponse[]> {
    return this.http.post<BookingsOverlapsResponse[]>('/api/Schedules/bookingsOverlaps', request);
  }

  deleteSchedule(deleteScheduleRequest: DeleteScheduleRequest):Observable<void> {
    const userLocalTime = DateTimeHelper.setUtcTimeZone(new Date());
    return this.http.post<void>('/api/Schedules/delete', { ...deleteScheduleRequest, userLocalTime });
  }

  getOpenPositions(openPositionsParams: OpenPositionParams): Observable<OpenPositionsList[]> {
    return this.http.post<OpenPositionsList[]>('/api/schedules/openPositions', openPositionsParams);
  }

  exportSchedule( employeeIds: number[], filters: EmployeesFilters): Observable<ScheduleExport[]> {
    return this.http.post<ScheduleExport[]>('/api/Schedules/exportschedules', { employeeIds, ...filters });
  }
  

  getEmployeeWorkCommitments( filters: ScheduleFilters | null = null): Observable<string[]> {
    return this.http.post<string[]>('/api/Schedules/getEmployeeWorkCommitments', filters );
  }

}
