import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { GetQueryParams } from '@core/helpers';

import { EmployeeCredentialsPage, EmployeeCredentialsRequestParams } from '../interfaces';

@Injectable()
export class EmployeeCredentialsApiService {

  constructor(private http: HttpClient) {}

  getEmployeeCredentials(params: EmployeeCredentialsRequestParams): Observable<EmployeeCredentialsPage> {
    return this.http.get<EmployeeCredentialsPage>(`/api/EmployeeCredentials/all`, { params: GetQueryParams(params) });
  }
}
