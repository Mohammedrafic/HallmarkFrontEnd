import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {ActivatedRoute} from "@angular/router";

import { Observable, of } from 'rxjs';
import {map} from 'rxjs/operators';

import {PageOfCollections} from '@shared/models/page.model';
import { DataSourceItem, FileForUpload } from '@core/interface';
import {InvoicesFilteringOptions, ManualInvoiceMeta, ManualInvoicePostDto, ManualInvoiceReason, ManualInvoiceTimesheetResponse} from '../interfaces';
import { OrganizationStructure } from '@shared/models/organization.model';

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

  public getInvoiceOrgReasons(orgId?: number | null): Observable<ManualInvoiceReason[]> {
    const endpoint = orgId ? `/api/ManualInvoiceRecords/creationreasons/organizations/${orgId}`
    : '/api/ManualInvoiceRecords/creationreasons';
    return this.http.get<ManualInvoiceReason[]>(endpoint);
  }

  public getManInvoiceMeta(orgId?: number): Observable<ManualInvoiceMeta[]> {

    const endpoint = orgId ? `/api/ManualInvoiceRecords/creationmetadata/organizations/${orgId}`
      : '/api/ManualInvoiceRecords/creationmetadata';
    return this.http.get<ManualInvoiceMeta[]>(endpoint);
  }

  public saveManualInvoice(payload: ManualInvoicePostDto): Observable<ManualInvoiceTimesheetResponse> {
    return this.http.post<ManualInvoiceTimesheetResponse>('/api/ManualInvoiceRecords', payload);
  }

  public getOrganizations(): Observable<DataSourceItem[]> {
    return this.http.get<DataSourceItem[]>(`/api/Agency/partneredorganizations`);
  }

  public getOrgStructure(orgId: number, isAgency: boolean): Observable<OrganizationStructure> {
    const endpoint = isAgency ? `/api/Organizations/structure/partnered/${orgId}`
    : '/api/Organizations/structure'
    return this.http.get<any>(endpoint);
  }

  public saveManualInvoiceAttachments(
    files: FileForUpload[], orgId: number | null, timesheetId: number): Observable<number[]> {
    if (!files.length) {
      return of([0]);
    }
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file.blob, file.fileName));

    const endPoint = orgId ? `/api/Timesheets/${timesheetId}/organization/${orgId}/files`
    : `/api/Timesheets/${timesheetId}/files`
    return this.http.post<number[]>(endPoint, formData);
  }
}
