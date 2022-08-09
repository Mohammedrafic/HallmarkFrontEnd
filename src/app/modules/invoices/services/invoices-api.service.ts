import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {ActivatedRoute} from "@angular/router";

import { Observable } from 'rxjs';
import {map} from 'rxjs/operators';

import {PageOfCollections} from '@shared/models/page.model';
import { DataSourceItem } from '@core/interface';
import {InvoicesFilteringOptions, ManualInvoiceMeta, ManualInvoiceReason} from '../interfaces';

@Injectable()
export class InvoicesApiService {
  constructor(
    private http: HttpClient,
  ) {}

  public getFiltersDataSource(
    organizationId: number | null = null
  ): Observable<InvoicesFilteringOptions> {
    return this.http.get<InvoicesFilteringOptions>(`/api/Timesheets/filteringOptions${organizationId ? `/${organizationId}` : ''}`);
  }

  public getInvoiceReasons(): Observable<ManualInvoiceReason[]> {
    return this.http.get<PageOfCollections<ManualInvoiceReason>>('/api/ManualInvoiceReasons')
      .pipe(
        map((data) => data.items)
      );
  }

  public getManInvoiceMeta(orgId?: number): Observable<ManualInvoiceMeta[]> {

    const endpoint = orgId ? `/api/ManualInvoices/creationmetadata/organization/${orgId}`
      : '/api/ManualInvoices/creationmetadata';
    return this.http.get<ManualInvoiceMeta[]>(endpoint);
  }

  public saveManualInvoice(payload: any): Observable<void> {
    return this.http.post<void>(``, payload);
  }

  public getOrganizations(): Observable<DataSourceItem[]> {
    return this.http.get<DataSourceItem[]>(`/api/Agency/partneredorganizations`);
  }
}
