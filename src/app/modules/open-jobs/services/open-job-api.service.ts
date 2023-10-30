import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { OpenJobPage } from '@shared/models';
import {
  FiltersState,
  LtaEmployeeDto,
  PerDiemEmployeeDto,
  RejectEmployeeDto,
  UpdateLtaEmployeeDTO,
  WithdrawPerDiemEmployeeDto
} from '../interfaces';

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

  public updateLtaEmployee(payload: UpdateLtaEmployeeDTO): Observable<void> {
    return this.http.put<void>('/api/IRPApplicants/update', payload);
  }

  public applyPerDiemEmployee(params: PerDiemEmployeeDto): Observable<void> {
    return this.http.post<void>(`/api/IRPApplicants/applyPerDiem`, params);
  }

  public withdrawPerDiemEmployee(params: WithdrawPerDiemEmployeeDto): Observable<void> {
    return this.http.post<void>(`/api/IRPApplicants/setWithdrawPerDiem`, params);
  }

  public rejectEmployee(payload: RejectEmployeeDto): Observable<void> {
    return this.http.post<void>('/api/IRPApplicants/reject', payload);
  }
}
