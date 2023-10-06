import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { OpenJobPage } from '@shared/models';

import { FiltersState } from '../interfaces';

@Injectable()
export class MyJobsApiService {

  constructor(private http: HttpClient) {}

  getMyJobsPage(params: FiltersState): Observable<OpenJobPage> {
    return this.http.post<OpenJobPage>(`/api/Employee/getMyJobs`, params);
  }
}
