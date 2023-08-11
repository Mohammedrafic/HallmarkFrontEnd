import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { map, Observable } from 'rxjs';

import { sortByField } from '@shared/helpers/sort-by-field.helper';
import { BusinessLines, BusinessLinesDtoModel } from '@shared/models/business-line.model';

@Injectable({
  providedIn: 'root',
})
export class BusinessLineService {
  constructor(private readonly httpClient: HttpClient) {}

  public getBusinessLines(pageNumber?: number, pageSize?: number, orderBy?: string): Observable<BusinessLinesDtoModel> {
    const params = this.getCloseReasonsParams(pageNumber, pageSize, orderBy);
    return this.httpClient.get<BusinessLinesDtoModel>('/api/businesslines', { params });
  }

  public saveBusinessLine(businessLine: { line: string; id: number }): Observable<BusinessLines> {
    return this.httpClient.put<BusinessLines>('/api/businesslines', businessLine);
  }

  public deleteBusinessLine(id: number): Observable<void> {
    return this.httpClient.delete<void>(`/api/businesslines/${id}`);
  }

  public getAllBusinessLines(): Observable<BusinessLines[]> {
    return this.httpClient.get<BusinessLines[]>('/api/businesslines/all').pipe(map((data) => sortByField(data, 'line')));
  }

  private getCloseReasonsParams(pageNumber?: number, pageSize?: number, orderBy?: string): HttpParams {
    let params = {};
    if (pageNumber) {
      params = { ...params, pageNumber };
    }
    if (pageSize) {
      params = { ...params, pageSize };
    }
    if (orderBy) {
      params = { ...params, orderBy };
    }
    return <HttpParams>params;
  }
}
