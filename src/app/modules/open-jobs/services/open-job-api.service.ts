import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { FiltersState, LtaEmployeeDto, OpenJobPage, PerDiemEmployeeDto } from '../interfaces';

@Injectable()
export class OpenJobApiService {
  constructor(
    private http: HttpClient,
  ) {}

  public getOpenJobsPage(params: FiltersState): Observable<OpenJobPage> {
    return this.http.post<OpenJobPage>(`/api/Employee/getAllOpenJobs`, params);
  }

  public applyLtaEmployee(params: LtaEmployeeDto): Observable<void> {
    return this.http.post<void>(`/api/IRPApplicants/create`, params);
  }

  public applyPerDiemEmployee(params: PerDiemEmployeeDto): Observable<void> {
    return this.http.post<void>(`/api/Schedules/create`, params);
  }
}
