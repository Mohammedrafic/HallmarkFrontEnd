import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {ActivatedRoute} from "@angular/router";

import { Observable } from 'rxjs';
import {map} from "rxjs/operators";

import {PageOfCollections} from "@shared/models/page.model";
import {InvoicesFilteringOptions, ManualInvoiceMeta, ManualInvoiceReason} from '../interfaces';

@Injectable()
export class InvoicesApiService {
  private isAgency: boolean;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
  ) {
    this.isAgency = this.route.snapshot.data['isAgencyArea'];
  }

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
    const endpoint = this.isAgency ? `/api/ManualInvoices/creationmetadata/organization/${orgId}`
      : '/api/ManualInvoices/creationmetadata';
    return this.http.get<ManualInvoiceMeta[]>(endpoint);
  }
}
