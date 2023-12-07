import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { PageOfCollections } from '@shared/models/page.model';
import { DataSourceItem, FileForUpload } from '@core/interface';
import {
  GroupInvoicesParams,
  InvoicesFilteringOptions,
  InvoicesFilterState,
  InvoiceStateDto,
  ManualInvoiceMeta,
  ManualInvoicePostDto,
  ManualInvoiceReason,
  ManualInvoicesData,
  ManualInvoiceTimesheetResponse,
  InvoiceDetail,
  PrintingPostDto,
  PrintInvoiceData,
  ManualInvoicePutDto,
  InvoicePayment,
  InvoicePaymentGetParams,
  PaymentCreationDto,
  PendingApprovalInvoice,
  PendingApprovalInvoicesData,
  PendingInvoicesData,
  InvoicesPendingInvoiceRecordsFilteringOptions,
  InvoiceManualPendingRecordsFilteringOptions,
  InvoiceDetailDto,
} from '../interfaces';
import { OrganizationStructure } from '@shared/models/organization.model';
import { ExportPayload } from '@shared/models/export.model';

import { ChangeStatusData } from '../../timesheets/interface';
import { CurrentUserPermission } from '@shared/models/permission.model';
import { sortByField } from '@shared/helpers/sort-by-field.helper';
import { GetQueryParams } from '@core/helpers/functions.helper';
import { AgencyInvoicesGridTab, InvoicesAggregationType, OrganizationInvoicesGridTab } from '../enums';
import { InvoiceAuditLogPayload, Invoicebase, agencyInvoicebase } from '../interfaces/invoice-auditlog.interface';

@Injectable()
export class InvoicesApiService {
  constructor(
    private http: HttpClient,
  ) {}

  private invoicedataSubject = new BehaviorSubject<any>(null);
  public data$ = this.invoicedataSubject.asObservable();

  setInvoiceData(data: any): void {
    this.invoicedataSubject.next(data);
  }
  getInvoiceData() {
    return this.invoicedataSubject.asObservable();
  }


  public getFiltersDataSource(orgId: number | null): Observable<InvoicesFilteringOptions> {
    return this.http.post<InvoicesFilteringOptions>(`/api/Invoices/filteroptions`, {
      organizationId: orgId,
    });
  }

  public getPendingInvoicesFiltersDataSource(): Observable<InvoicesPendingInvoiceRecordsFilteringOptions> {
    return this.http.get<InvoicesPendingInvoiceRecordsFilteringOptions>(`/api/PendingInvoices/filteroptions`);
  }

  public getManualInvoicePendingFiltersDataSource(
    id: number | null
  ): Observable<InvoiceManualPendingRecordsFilteringOptions> {
    if(id) {
      return this.http.get<InvoiceManualPendingRecordsFilteringOptions>('/api/manualInvoiceRecords/filterOptions', {
        params: { organizationid: id },
      });
    } else {
      return this.http.get<InvoiceManualPendingRecordsFilteringOptions>('/api/manualInvoiceRecords/filterOptions');
    }
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
    return this.http.get<ManualInvoiceReason[]>(endpoint).pipe(map((data) => sortByField(data, 'reason')));
  }

  public getManInvoiceMeta(orgId?: number): Observable<ManualInvoiceMeta[]> {

    const endpoint = orgId ? `/api/ManualInvoiceRecords/creationmetadata/organizations/${orgId}`
      : '/api/ManualInvoiceRecords/creationmetadata';
    return this.http.get<ManualInvoiceMeta[]>(endpoint);
  }

  public saveManualInvoice(payload: ManualInvoicePostDto): Observable<ManualInvoiceTimesheetResponse> {
    return this.http.post<ManualInvoiceTimesheetResponse>('/api/ManualInvoiceRecords', payload);
  }

  public updateManualInvoice(payload: ManualInvoicePutDto): Observable<ManualInvoiceTimesheetResponse> {
    return this.http.put<ManualInvoiceTimesheetResponse>('/api/ManualInvoiceRecords', payload);
  }

  public deleteManualInvoice(id: number, organizationId: number | null): Observable<void> {
    if (organizationId) {
      return this.agencyDeleteManualInvoice(id, organizationId);
    }
    return this.organizationDeleteManualInvoice(id);
  }

  public getAgencyFeeApplicable(id: number): Observable<boolean> {
    return this.http.get<boolean>(`/api/ManualInvoiceRecords/agencyFeeApplicable/${id}`);
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
    : '/api/Organizations/structure';
    return this.http.get<OrganizationStructure>(endpoint);
  }

  public saveManualInvoiceAttachments(
    files: FileForUpload[], orgId: number | null, timesheetId: number): Observable<number[]> {
    if (!files?.length) {
      return of([0]);
    }
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file.blob, file.fileName));

    const endPoint = orgId ? `/api/Timesheets/${timesheetId}/organization/${orgId}/files`
    : `/api/Timesheets/${timesheetId}/files`;
    return this.http.post<number[]>(endPoint, formData);
  }

  public getManualInvoices(data: InvoicesFilterState): Observable<ManualInvoicesData> {
    return this.http.post<ManualInvoicesData>('/api/ManualInvoiceRecords/filtered', data);
  }

  public getPendingInvoices(data: InvoicesFilterState): Observable<PendingInvoicesData> {
    return this.http.post<PendingInvoicesData>('/api/PendingInvoices', data);
  }

  public getPendingApproval(data: InvoicesFilterState, isAgency = false): Observable<PendingApprovalInvoicesData> {
    return this.http.post<PendingApprovalInvoicesData>(`/api/Invoices${isAgency ? '/agency' : ''}/filtered`, data);
  }

  public changeManualInvoiceStatus(data: ChangeStatusData): Observable<void> {
    return this.http.post<void>(`/api/TimesheetState/setstatus`, data);
  }

  public changeInvoiceStatus(data: InvoiceStateDto): Observable<PendingApprovalInvoice> {
    const endpoint = !data.organizationId ? '/api/Invoices/setstatus' : '/api/Invoices/agency/setstatus';
    return this.http.post<PendingApprovalInvoice>(endpoint, data);
  }

  public bulkApprove(timesheetIds: number[]): Observable<void> {
    return this.http.post<void>('/api/TimesheetState/bulkapprove', { timesheetIds });
  }

  public groupInvoices(data: GroupInvoicesParams): Observable<PendingApprovalInvoice[]> {
    return this.http.post<PendingApprovalInvoice[]>('/api/Invoices', data);
  }

  public getInvoicesForPrinting(
    payload: { organizationIds?: number[]; invoiceIds: number[] },
    isAgency = false
  ): Observable<InvoiceDetailDto[]> {
    return this.http.post<InvoiceDetailDto[]>(`/api/Invoices${isAgency ? '/agency' : ''}/printing`, payload);
  }

  public export(data: ExportPayload): Observable<Blob>  {
    const testData = { field1: 'Field1Value', field2: 'Field2Value' };

    return of(
      new Blob([JSON.stringify(testData, null, 2)], {type: 'application/text'})
    );
  }

  public getPrintData(body: PrintingPostDto, isAgency: boolean, selectedTabIndex?:number): Observable<PrintInvoiceData[]> {
    const endpoint = isAgency ? '/api/Invoices/agency/printing' :  selectedTabIndex === OrganizationInvoicesGridTab.PendingRecords ?  '/api/PendingInvoices/printing' : '/api/Invoices/printing';
    return this.http.post<PrintInvoiceData[]>(endpoint, body);
  }

  public getAgencyPermissions(): Observable<CurrentUserPermission[]> {
    return this.http.get<CurrentUserPermission[]>('/api/Permissions/currentUser');
  }

  public getInvoicesPayments(params: InvoicePaymentGetParams): Observable<InvoicePayment[]> {
    return this.http.get<InvoicePayment[]>('/api/Invoices/payments', {
      params: GetQueryParams<InvoicePaymentGetParams>(params),
    });
  }

  public savePayment(paymentDto: PaymentCreationDto): Observable<void> {
    return this.http.post<void>('/api/Invoices/payments', paymentDto);
  }

  public getCheckData(checkId: string): Observable<PaymentCreationDto> {
    return this.http.get<PaymentCreationDto>(`/api/Invoices/payments/check/${checkId}`);
  }

  public deletePayment(id: number): Observable<void> {
    return this.http.delete<void>(`/api/Invoices/payments/${id}`);
  }

  public getGroupingOptionsIds(orgId: number): Observable<InvoicesAggregationType[]> {
    return this.http.post<InvoicesAggregationType[]>(`/api/PendingInvoices/createinvoicebyoptions`,
    { organizationId: orgId });
  }

  public exportInvoices(payload: ExportPayload, isAgency: boolean,selectedTabIndex:number): Observable<Blob> {
    const url = isAgency ?  selectedTabIndex === AgencyInvoicesGridTab.Manual?  '/api/Invoices/agency/export/manualinvoicepending' : '/api/Invoices/agency/export' :
     selectedTabIndex === OrganizationInvoicesGridTab.PendingRecords ? '/api/PendingInvoices/export' : 
     selectedTabIndex === OrganizationInvoicesGridTab.Manual ? '/api/Invoices/agency/export/manualinvoicepending' 
     :'/api/Invoices/export';
    return this.http.post(url, payload, { responseType: 'blob' });
  }

  private organizationDeleteManualInvoice(id: number): Observable<void> {
    return this.http.delete<void>(`/api/ManualInvoiceRecords/${id}`);
  }

  private agencyDeleteManualInvoice(id: number, organizationId: number | null): Observable<void> {
    return this.http.delete<void>(`/api/ManualInvoiceRecords/${id}/organizations/${organizationId}`);
  }
  // Audit log api
  public getInvoiceAuditHistory(payload: InvoiceAuditLogPayload,isagency:boolean): Observable<Invoicebase[]> {
    const url = "/api/Audit/organizationInvoiceAuditHistory";
    return this.http.post<Invoicebase[]>(url, payload);
   }

   public getAgencyInvoiceAuditHistory(payload: InvoiceAuditLogPayload,isagency:boolean): Observable<agencyInvoicebase[]> {
    const url = "/api/Audit/agencyInvoiceAuditHistory"
    return this.http.post<agencyInvoicebase[]>(url, payload);
   }
}
