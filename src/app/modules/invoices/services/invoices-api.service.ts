import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { PageOfCollections } from '@shared/models/page.model';
import { DataSourceItem, FileForUpload } from '@core/interface';
import {
  GetPendingApprovalParams,
  GroupInvoicesParams,
  InvoicesFilteringOptions,
  InvoicesFilterState,
  ManualInvoiceMeta,
  ManualInvoicePostDto,
  ManualInvoiceReason, ManualInvoicesData, ManualInvoiceTimesheetResponse, PrintingPostDto, PrintInvoiceData
} from '../interfaces';
import { OrganizationStructure } from '@shared/models/organization.model';
import { PendingInvoicesData } from '../interfaces/pending-invoice-record.interface';
import { ChangeStatusData } from '../../timesheets/interface';
import { PendingApprovalInvoice, PendingApprovalInvoicesData } from '../interfaces/pending-approval-invoice.interface';

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

  public deleteManualInvoice(id: number, organizationId: number | null): Observable<void> {
    return organizationId ? this.agencyDeleteManualInvoice(id, organizationId) : this.organizationDeleteManualInvoice(id);
  }

    /**
   * TODO: remove this with shared service
   */
  public getOrganizations(): Observable<DataSourceItem[]> {
    return this.http.get<DataSourceItem[]>(`/api/Agency/partneredorganizations`);
  }

  /**
   * TODO: remove this with shared service
   */
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

  public getManualInvoices(data: InvoicesFilterState): Observable<ManualInvoicesData> {
    return this.http.post<ManualInvoicesData>('/api/ManualInvoiceRecords/filtered', data);
  }

  public getPendingInvoices(data: InvoicesFilterState): Observable<PendingInvoicesData> {
    return this.http.post<PendingInvoicesData>('/api/PendingInvoices', data);
  }

  public getPendingApproval(data: GetPendingApprovalParams): Observable<PendingApprovalInvoicesData> {
    return this.http.post<PendingApprovalInvoicesData>('/api/Invoices/filtered', data);
  }

  public changeInvoiceStatus(data: ChangeStatusData): Observable<void> {
    return this.http.post<void>(`/api/TimesheetState/setstatus`, data);
  }

  public bulkApprove(timesheetIds: number[]): Observable<void> {
    return this.http.post<void>('/api/TimesheetState/bulkapprove', { timesheetIds });
  }

  public groupInvoices(data: GroupInvoicesParams): Observable<void> {
    return this.http.post<void>('/api/Invoices', data);
  }

  public approvePendingApproveInvoice(data: PendingApprovalInvoice): Observable<null> {
    // TODO: Change to API when its ready
    return of(null);
  }

  public getPrintData(body: PrintingPostDto): Observable<PrintInvoiceData[]> {
    return this.http.post<PrintInvoiceData[]>('/api/Invoices/printing', body);
  }

  private organizationDeleteManualInvoice(id: number): Observable<void> {
    return this.http.delete<void>(`/api/ManualInvoiceRecords/${id}`);
  }

  private agencyDeleteManualInvoice(id: number, organizationId: number | null): Observable<void> {
    return this.http.delete<void>(`/api/ManualInvoiceRecords/${id}/organizations/${organizationId}`);
  }
}
