import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { InvoicesFilteringOptions } from '../interfaces';

@Injectable()
export class InvoicesApiService {
  constructor(private http: HttpClient) {
  }

  public getFiltersDataSource(
    organizationId: number | null = null
  ): Observable<InvoicesFilteringOptions> {
    return this.http.get<InvoicesFilteringOptions>(`/api/Timesheets/filteringOptions${organizationId ? `/${organizationId}` : ''}`);
  }
}
