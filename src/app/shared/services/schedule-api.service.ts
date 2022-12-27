import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, of } from 'rxjs';

import { ScheduleFilters, ScheduleModel } from '../../modules/schedule/interface/schedule.model';
import { MOK_DATA } from '../../modules/schedule/constants';

@Injectable()
export class ScheduleApiService {
  constructor(private http: HttpClient) {
  }

  getScheduleData(filters: any = null): Observable<ScheduleModel[]> {
    return of(MOK_DATA);
  }

  getScheduleEmployees(filters: ScheduleFilters | null = null): Observable<ScheduleModel[]> {
    return this.http.post<ScheduleModel[]>('/api/Schedules/employees', filters);
  }

  getSchedulesByEmployeesIds(employeeIds: number[]): Observable<ScheduleModel[]> {
    return this.http.post<ScheduleModel[]>('/api/Schedules/employees', { employeeIds });
  }
}
