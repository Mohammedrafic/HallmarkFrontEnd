import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BusinessLines, BusinessLinesDtoModel } from '@shared/models/business-line.model';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BusinessLineService {

  constructor(private readonly httpClient: HttpClient) { }

  public getBusinessLines(pageNumber?: number, pageSize?: number, orderBy?: string): Observable<BusinessLines[]> {
    const params = this.getCloseReasonsParams(pageNumber, pageSize, orderBy);
    return this.httpClient.get<BusinessLinesDtoModel>('api/businesslines', { params }).pipe(map((data) => data.items));
  }

  public addBusinessLine(businessLine: {id: number, line: string}): Observable<BusinessLines> {
    return this.httpClient.put<BusinessLines>('api/businesslines', businessLine);
  }

  public deleteBusinessLine(id: number): Observable<void> {
    return this.httpClient.delete<void>(`api/businesslines/${id}`);
  }

  private getCloseReasonsParams(pageNumber?: number, pageSize?: number, orderBy?: string, getAll?: boolean): HttpParams {
    let params = {};
    if (pageNumber) params = {...params, pageNumber};
    if (pageSize) params = {...params, pageSize};
    if (orderBy) params = {...params, orderBy};

    return <HttpParams>params;
  }
}
