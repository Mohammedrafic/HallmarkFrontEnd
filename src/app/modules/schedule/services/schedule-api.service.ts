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
    return this.http.post<CandidateSchedules[]>('/api/Schedules/byEmployeesIds', { employeeIds, ...filters });
  }

  getUnavailabilityReasons(visibleForIRPCandidates: boolean | null = null): Observable<UnavailabilityReason[]> {
    return this.http.post<UnavailabilityReason[]>(
      '/api/UnavailabilityReasons/forCurrentBusinessUnit',
      { visibleForIRPCandidates }
    );
  }

  createSchedule(employeeScheduledDays: Schedule): Observable<void> {
    const userLocalTime = DateTimeHelper.toUtcFormat(new Date());
    return this.http.post<void>('/api/Schedules/create', {...employeeScheduledDays, userLocalTime });
  }

  createBookSchedule(employeeBookDays: ScheduleInt.ScheduleBook):Observable<ScheduleBookingErrors[]> {
    return this.http.post<ScheduleBookingErrors[]>('/api/Schedules/book', employeeBookDays);
  }

  getEmployeesStructure(employeeId: number): Observable<OrganizationStructure> {
    return this.http.get<OrganizationStructure>(
      `/api/EmployeeFilterOptions/structuredDepartments`, { params: { EmployeeId: employeeId }}
    );
  }

  getSkillsByEmployees(departmentId: number, employeeId?: number): Observable<Skill[]> {
    const byEmployeesId = { employeeId, departmentId };
    const byDepartmentId = { departmentId };

    return this.http.get<Skill[]>(
      '/api/EmployeeFilterOptions/skillsByDepartment',
      { params: employeeId ? byEmployeesId : byDepartmentId }
    );
  }

  updateScheduledShift(scheduledShift: ScheduledShift, type: ScheduleType):Observable<void> {
    const userLocalTime = DateTimeHelper.toUtcFormat(new Date());
    return this.http.post<void>(
      type === ScheduleType.Book ? '/api/Schedules/booking/update' : '/api/Schedules/schedule/update',
      { ...scheduledShift, userLocalTime },
    );
  }

  checkBookingsOverlaps(request: BookingsOverlapsRequest):Observable<BookingsOverlapsResponse[]> {
    return this.http.post<BookingsOverlapsResponse[]>('/api/Schedules/bookingsOverlaps', request);
  }

  deleteSchedule(deleteScheduleRequest: DeleteScheduleRequest):Observable<void> {
    return this.http.post<void>('/api/Schedules/delete', deleteScheduleRequest);
  }

  getOpenPositions(openPositionsParams: OpenPositionParams): Observable<OpenPositionsList[]> {
    return this.http.post<OpenPositionsList[]>('/api/schedules/openPositions', openPositionsParams);
  }
}
