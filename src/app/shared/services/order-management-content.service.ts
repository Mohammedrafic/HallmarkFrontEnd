import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

import { map, Observable, switchMap } from 'rxjs';

import {
  AcceptJobDTO,
  AgencyOrderFilters,
  AgencyOrderManagement,
  AgencyOrderManagementPage,
  ApplicantStatus,
  AuditLogPayload,
  CandidateCancellationReason,
  clearToStartDataset,
  CreateOrderDto,
  EditOrderDto,
  IrpCandidatesParams,
  IrpOrderCandidate,
  IrpOrderCandidateDto,
  JobDistributionfilters,
  OnboardCandidateEmail,
  Order,
  OrderAuditHistory,
  OrderBillRateAuditHistory,
  OrderCandidateJob,
  OrderCandidatesListPage,
  OrderClassificationAuditHistory,
  OrderContactAuditHistory,
  OrderCredentialAuditHistory,
  OrderFilterDataSource,
  OrderJobDistributionAuditHistory,
  OrderManagement,
  OrderManagementFilter,
  OrderManagementPage,
  OrdersJourneyPage,
  OrderWorkLocationAuditHistory,
  OrgStructureDto,
  SuggestedDetails,
} from '@shared/models/order-management.model';
import { CandidateCancellation } from '@shared/models/candidate-cancellation.model';
import { OrganizationStateWithKeyCode } from '@shared/models/organization-state-with-key-code.model';
import { WorkflowByDepartmentAndSkill } from '@shared/models/workflow-mapping.model';
import { AssociateAgency } from '@shared/models/associate-agency.model';
import { OrderType } from '@shared/enums/order-type';
import { BillRate } from '@shared/models/bill-rate.model';
import { RejectReasonPayload } from '@shared/models/reject-reason.model';
import { HistoricalEvent } from '@shared/models';
import { ExportPayload } from '@shared/models/export.model';
import {
  OrderManagementIRPSystemId,
  OrderManagementIRPTabs,
  OrganizationOrderManagementTabs,
} from '@shared/enums/order-management-tabs.enum';
import { Comment } from '@shared/models/comment.model';
import { DateTimeHelper } from '@core/helpers';
import { orderFieldsConfig } from '@client/order-management/components/add-edit-order/order-fields';
import { Penalty } from '@shared/models/penalty.model';
import { JobCancellationReason } from '@shared/enums/candidate-cancellation';
import { sortByField } from '@shared/helpers/sort-by-field.helper';
import { PageOfCollections } from '@shared/models/page.model';
import { AdaptIrpCandidates } from '@shared/components/order-candidate-list/order-candidate-list.utils';
import { GetQueryParams } from '@core/helpers/functions.helper';
import { ScheduleShift } from '@shared/models/schedule-shift.model';
import { CancelIrpCandidateDto } from '@shared/components/order-candidate-list/interfaces';

@Injectable({ providedIn: 'root' })
export class OrderManagementContentService {
  constructor(private http: HttpClient) {}

  /**
   * Counts number of shifts of reorders within specified period of time from current date
   * @param orders list of orders
   * @param period number of days counting of shifts should be performed
   */
  public countShiftsWithinPeriod(orders: OrderManagementPage | AgencyOrderManagementPage, period = 90): void {
    const today = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + period);
    orders.items.forEach((item: OrderManagement | AgencyOrderManagement) => {
      let shiftsCount = 0;
      item.reOrders?.forEach((reOrder: OrderManagement) => {
        const reOrderStartDate = new Date(reOrder.startDate);
        if (reOrderStartDate > today && reOrderStartDate < endDate) {
          shiftsCount += reOrder.openPositions;
        }
      });
      item.shiftsNext90Days = shiftsCount;
    });
  }

  /**
   * Get the incomplete order
   @param payload filter with details we need to get
   */
  public getIncompleteOrders(payload: OrderManagementFilter | object): Observable<OrderManagementPage> {
    return this.http.post<OrderManagementPage>(`/api/Orders/Incomplete`, payload);
  }

  /**
   * Get the orders
   @param payload filter with details we need to get
   */
   public getOrders(payload: OrderManagementFilter | object): Observable<OrderManagementPage> {
      return this.http.post<OrderManagementPage>(`/api/Orders/all`, payload);
  }

  public getIRPTemplates(payload: OrderManagementFilter | object): Observable<OrderManagementPage> {
      return this.http.post<OrderManagementPage>(`/api/IRPOrders/filtered`, payload);
  }

    /**
   * Get the orders journey
   @param payload filter with details we need to get
   */
   public getOrdersJourney(payload: OrderManagementFilter | object): Observable<OrdersJourneyPage> {
    return this.http.post<OrdersJourneyPage>(`/api/Orders/allOrderJourney`, payload);
  }

  /**
   * Lock/Unlock the order
   */
  public setLock(orderId: number, lockStatus: boolean,lockStatusIRP:boolean): Observable<boolean> {
    return this.http.post<boolean>(`/api/Orders/setLock`, { orderId, lockStatus ,lockStatusIRP});
  }

  /**
   * Get the agency orders
   @param pageNumber
   @param pageSize
   @param filters
   */
  public getAgencyOrders(
    pageNumber: number,
    pageSize: number,
    filters: AgencyOrderFilters
  ): Observable<AgencyOrderManagementPage> {
    return this.http.post<AgencyOrderManagementPage>(`/api/Agency/Orders`, { pageNumber, pageSize, ...filters });
  }

  /**
   * Get the agency order candidates
   @param orderId
   @param organizationId
   @param pageNumber
   @param pageSize
   */
  public getAgencyOrderCandidatesList(
    orderId: number,
    organizationId: number,
    pageNumber: number,
    pageSize: number,
    excludeDeployed?: boolean,
    searchTerm?: string,
  ): Observable<OrderCandidatesListPage> {
    let params: any = {
      PageNumber: pageNumber,
      PageSize: pageSize,
    };

    if (excludeDeployed) {
      params = { ...params, excludeDeployed };
    }

    if(searchTerm) {
      params = { ...params, searchTerm };
    }
    return this.http.get<OrderCandidatesListPage>(
      `/api/CandidateProfile/order/${orderId}/organization/${organizationId}`,
      { params }
    );
  }

  /**
   * Get order by id
   @param id
   */
  public getAgencyOrderById(id: number, organizationId: number): Observable<Order> {
    return this.http.get<Order>(`/api/Orders/${id}/organization/${organizationId}`);
  }

  /**
   * Get candidate job
   @param organizationId
   @param jobId
   */
  public getCandidateJob(organizationId: number, jobId: number): Observable<OrderCandidateJob> {
    return this.http.get<OrderCandidateJob>(
      `/api/AppliedCandidates/candidateJob?OrganizationId=${organizationId}&JobId=${jobId}`
    );
  }

 /**
  * Update candidate job
  * @param payload
  */
  public getPredefinedPenalties(payload: OrderCandidateJob, reason: JobCancellationReason): Observable<Penalty> {
    return this.http.post<Penalty>(`/api/CandidateCancellationSettings/predefined`, {
      organizationId: payload.organizationId,
      jobId: payload.jobId,
      locationId: payload.order.locationId,
      reason: reason,
    });
  }

  /**
   * Update candidate job
   @param payload
   */
  public updateCandidateJob(payload: AcceptJobDTO): Observable<{ weekStartDate: string }[]> {
    return this.http.post<{ weekStartDate: string }[]>(`/api/AppliedCandidates/updateCandidateJob`, payload);
  }

  /**
   * Get available steps
   @param organizationId
   @param jobId
   */
  public getAvailableSteps(organizationId: number, jobId: number): Observable<ApplicantStatus[]> {
    return this.http.get<ApplicantStatus[]>(
      `/api/AppliedCandidates/availableSteps?OrganizationId=${organizationId}&JobId=${jobId}`
    ).pipe(map((data) => sortByField(data, 'statusText')));
  }

  public getOrderById(id: number, isIRP?: boolean, system?: string): Observable<Order> {
    if(isIRP || system === "IRP") {
      return this.http.get<Order>(`/api/Orders/${id}`, { params: GetQueryParams({ isIRPTab: isIRP })});
    } else {
      return this.http.get<Order>(`/api/Orders/${id}`);
    }
  }

  /**
   * Get the agency order candidates
   @param orderId
   @param organizationId
   @param pageNumber
   @param pageSize
   */
  public getOrderCandidatesList(
    orderId: number,
    organizationId: number,
    pageNumber: number,
    pageSize: number,
    excludeDeployed?: boolean,
    searchTerm?: string,
  ): Observable<OrderCandidatesListPage> {
    let params: any = {
      PageNumber: pageNumber,
      PageSize: pageSize,
    };

    if (excludeDeployed) {
      params = { ...params, excludeDeployed };
    }

    if(searchTerm) {
      params = { ...params, searchTerm };
    }
    return this.http.get<OrderCandidatesListPage>(`/api/CandidateProfile/order/${orderId}`, {
      params,
    });
  }

  public getIrpExtensionCandidates(orderId: number,
    paramsData: IrpCandidatesParams): Observable<OrderCandidatesListPage> {
    return this.http.get<OrderCandidatesListPage>(`/api/IRPOrders/${orderId}/candidates`, {
      params: GetQueryParams(paramsData),
    })
  }


  public getIrpCandidates(orderId: number,
    paramsData: IrpCandidatesParams): Observable<PageOfCollections<IrpOrderCandidate>> {
    return this.http.get<PageOfCollections<IrpOrderCandidateDto>>(`/api/IRPOrders/${orderId}/candidates`, {
      params: GetQueryParams(paramsData),
    })
    .pipe(
      map((response) => AdaptIrpCandidates(response))
    );
  }

  /**
   * Get the list of states for organization
   * @return Array of states
   */
  public getOrganizationStatesWitKeyCode(): Observable<OrganizationStateWithKeyCode[]> {
    return this.http.get<OrganizationStateWithKeyCode[]>('/api/Organizations/states');
  }

  /**
   * Get the list of workflows by department and skill
   * @param departmentId
   * @param skillId
   * @return Array of workflows
   */
  public getWorkflowsByDepartmentAndSkill(
    departmentId: number,
    skillId: number
  ): Observable<WorkflowByDepartmentAndSkill[]> {
    return this.http.get<WorkflowByDepartmentAndSkill[]>(
      `/api/WorkflowMapping/department/${departmentId}/skill/${skillId}`
    );
  }

  /**
   * Get the list of agencies for organization
   * @return Array of associate agencies
   */
  public getAssociateAgencies(lastSelectedBusinessUnitId?: number): Observable<AssociateAgency[]> {
    let headers = {};

    if (lastSelectedBusinessUnitId) {
      headers = new HttpHeaders({ 'selected-businessunit-id': `${lastSelectedBusinessUnitId}` });
    }

    return this.http.get<AssociateAgency[]>('/api/AssociateAgencies', { headers });
  }

  /**
   * Get predefined bill rates for order by order type, department id and skill id
   * @param orderType
   * @param departmentId
   * @param skillId
   * @returns list of predefined bill rates
   */
  public getPredefinedBillRates(orderType: OrderType, departmentId: number, skillId: number, jobStartDate?: string, jobEndDate?: string): Observable<BillRate[]> {
    let params = new HttpParams()
      .append('orderType', orderType)
      .append('departmentId', departmentId)
      .append('skillId', skillId);

    if (jobStartDate && jobEndDate) {
      params = params.append('jobStartDate', jobStartDate).append('jobEndDate', jobEndDate);
    }
    return this.http.get<BillRate[]>('/api/BillRates/predefined/forOrder', { params }).pipe(
      map((items) =>
        items.map((rate) => {
          return {
            ...rate,
            isPredefined: true,
          };
        })
      )
    );
  }

  /**
   * Get workLocation and contactDetails based on location
   * @param locationId
   * @returns suggested details data
   */
  public getSuggestedDetails(locationId: number | string): Observable<SuggestedDetails> {
    return this.http.get<SuggestedDetails>(`/api/Orders/suggestedDetails/${locationId}`);
  }

  /**
   * Create order
   * @param order object to save
   * @param documents array of attached documents
   * @return saved order
   */
  public saveOrder(
    order: CreateOrderDto,
    documents: Blob[],
    comments: Comment[] | undefined,
    lastSelectedBusinessUnitId?: number
  ): Observable<Order> {
    let headers = {};

    if (lastSelectedBusinessUnitId) {
      headers = new HttpHeaders({ 'selected-businessunit-id': `${lastSelectedBusinessUnitId}` });
    }

    return this.http
      .post<Order>('/api/Orders', this.changeDateToUtc(this.prepareFieldsByOrderType(order)), { headers })
      .pipe(
        switchMap((createdOrder) => {
          const formData = new FormData();
          if (comments?.length) {
            comments.forEach((comment: Comment) => {
              comment.commentContainerId = createdOrder.commentContainerId as number;
            });
            this.http.post('/api/Comments', { comments }).subscribe();
          }
          documents.forEach((document) => formData.append('documents', document));
          return this.http.post(`/api/Orders/${createdOrder.id}/documents`, formData).pipe(map(() => createdOrder));
        })
      );
  }

  public saveIrpOrder(order: CreateOrderDto): Observable<Order[]>{
    return this.http.post<Order[]>('/api/IRPOrders', this.changeDateToUtc(order));
  }

  public saveDocumentsForIrpOrder(formData: FormData): Observable<Blob[]> {
    return this.http.post<Blob[]>(`/api/IRPOrders/documents`, formData) as Observable<Blob[]>;
  }

  public editIrpOrder(order: EditOrderDto): Observable<Order> {
    return this.http.put<Order>('/api/IRPOrders', this.changeDateToUtc(order));
  }

  /**
   * Edit order
   * @param order object to edit
   * @return edited order
   */
  public editOrder(order: EditOrderDto, documents: Blob[]): Observable<Order> {
    return this.http.put<Order>('/api/Orders', this.changeDateToUtc(this.prepareFieldsByOrderType(order))).pipe(
      switchMap((editedOrder) => {
        const formData = new FormData();
        documents.forEach((document) => formData.append('documents', document));
        return this.http.post(`/api/Orders/${editedOrder.id}/documents`, formData).pipe(map(() => editedOrder));
      })
    );
  }

  /**
   * Delete order
   * @param id order id to delete
   */
  public deleteOrder(id: number): Observable<any> {
    return this.http.delete<Order>('/api/Orders', { params: { orderId: id } });
  }

  public approveOrder(orderId: number, isIRPTab: boolean): Observable<string> {
    return this.http.post(`/api/Order/approve`, { orderId, isIRPTab }, { responseType: 'text' });
  }

  /**
   * Reject Candidate Job
   * @param payload
   */
  public rejectCandidateJob(payload: RejectReasonPayload): Observable<void> {
    return this.http.post<void>('/api/AppliedCandidates/rejectCandidateJob', payload);
  }

  public cancelCandidateJob(payload: CandidateCancellation): Observable<void> {
    const requestBody = {
      jobId: payload.jobId,
      organizationId: payload.organizationId,
      actualEndDate: payload.jobCancellationDto.actualEndDate,
      jobCancellationDto: {
        jobCancellationReason: payload.jobCancellationDto.jobCancellationReason,
        penaltyCriteria: payload.jobCancellationDto.penaltyCriteria,
        rate: payload.jobCancellationDto.rate,
        hours: payload.jobCancellationDto.hours,
      },
    };

    return this.http.post<void>('/api/AppliedCandidates/cancelCandidateJob', requestBody);
  }

  public cancelIrpCandidate(payload: CancelIrpCandidateDto): Observable<void> {
    return this.http.post<void>('/api/IRPApplicants/cancel', payload);
  }


  /**
   * Get order filter data sources
   */
  public getOrderFilterDataSources(isIRP = false): Observable<OrderFilterDataSource> {
    let url = '/api/OrdersFilteringOptions/organization';
    if (isIRP) {
      url += '/irp';
    }
    return this.http.get<OrderFilterDataSource>(url).pipe(
      map((data) => {
        const sortedFields: Record<keyof OrderFilterDataSource, string> = {
          candidateStatuses: 'statusText',
          orderStatuses: 'statusText',
          partneredAgencies: 'name',
          poNumbers: 'poNumber',
          projectNames: 'projectName',
          specialProjectCategories: 'projectType',
          reorderStatuses: 'statusText',
        };

        return Object.fromEntries(
          Object.entries(data)
            .map(([key, value]) =>
              [[key], sortByField(value, sortedFields[key as keyof OrderFilterDataSource])]
            ));
      }),
    );
  }

  /**
   * Get the historical data for candidate
   * @return Array of historical events
   */
  public getHistoricalData(organizationId: number, jobId: number,isIrpFlag:boolean): Observable<HistoricalEvent[]> {
   if(isIrpFlag)
   {
    return this.http.get<HistoricalEvent[]>(
      `/api/AppliedCandidates/IrpHistoricalData?OrganizationId=${organizationId}&CandidateJobId=${jobId}`
    );
   }
    return this.http.get<HistoricalEvent[]>(
      `/api/AppliedCandidates/historicalData?OrganizationId=${organizationId}&CandidateJobId=${jobId}`
    );
  }

  /**
   * Export organization list
   * @param payload
   * @param tab
   */
  public export(payload: ExportPayload, tab: OrganizationOrderManagementTabs): Observable<any> {
    switch (tab) {
      case OrganizationOrderManagementTabs.PerDiem:
        return this.http.post(`/api/Orders/perdiem/export`, payload, { responseType: 'blob' });
      case OrganizationOrderManagementTabs.ReOrders:
        return this.http.post(`/api/Orders/ReOrders/export`, payload, { responseType: 'blob' }); // TODO: modification pending after BE implementation
      default:
        return this.http.post(`/api/Orders/export`, payload, { responseType: 'blob' });
    }
  }
/**
   * Export IRP Orders list*/
  public irpexport(payload: ExportPayload, tab: OrderManagementIRPTabs): Observable<any> {
    return this.http.post(`/api/IRPOrders/export`, payload, { responseType: 'blob' });
  }

  /**
   * Export IRP Orders list*/
  public orderJourneyexport(payload: ExportPayload): Observable<any> {
    return this.http.post(`/api/Orders/exportOrderJourney`, payload, { responseType: 'blob' });
  }


  /**
   * Export agency list
   * @param payload
   */
  public exportAgency(payload: ExportPayload): Observable<Blob> {
    return this.http.post(`/api/agency/orders/export`, payload, { responseType: 'blob' });
  }

  /**
   * Duplicate order by id
   * @param payload order id to duplicate
   * @return id of newly created order
   */
  public duplicate(payload: number, system: OrderManagementIRPSystemId): Observable<number> {
    const url = system === OrderManagementIRPSystemId.VMS ? `/api/Orders/${payload}/duplicate`
    : `/api/IRPOrders/${payload}/duplicate`;

    return this.http.post<number>(url, {});
  }

  public getRegularBillRate(
    orderType: OrderType,
    departmentId: number,
    skillId: number,
    jobStartDate: string,
    jobEndDate: string,
    lastSelectedBusinessUnitId?: number
  ): Observable<BillRate> {
    let headers = {};

    if (lastSelectedBusinessUnitId) {
      headers = new HttpHeaders({ 'selected-businessunit-id': `${lastSelectedBusinessUnitId}` });
    }
    return this.http.get<BillRate>('/api/billrates/regular/fororder', {
      headers,
      params: { orderType, departmentId, skillId, jobStartDate, jobEndDate },
    });
  }

  private changeDateToUtc(order: Partial<CreateOrderDto>): CreateOrderDto {
    const { shiftStartTime, shiftEndTime, jobStartDate, jobEndDate } = order;

    return <CreateOrderDto>{
      ...order,
      jobStartDate: jobStartDate ? new Date(DateTimeHelper.setUtcTimeZone(jobStartDate)) : null,
      jobEndDate: jobEndDate ? new Date(DateTimeHelper.setUtcTimeZone(jobEndDate)) : null,
      shiftStartTime: shiftStartTime ? new Date(DateTimeHelper.setUtcTimeZone(shiftStartTime)) : null,
      shiftEndTime: shiftEndTime ? new Date(DateTimeHelper.setUtcTimeZone(shiftEndTime)) : null,
    };
  }

  private prepareFieldsByOrderType(order: CreateOrderDto): Partial<CreateOrderDto> {
    return Object.fromEntries(
      Object.entries(order).map(([key, value]: [string, string | number]) => [
        key,
        orderFieldsConfig[order.orderType].includes(key) ? value : null,
      ])
    );
  }

  public getCandidateCancellationReasons(orderId: number): Observable<CandidateCancellationReason[]> {
    return this.http.get<CandidateCancellationReason[]>(
      `/api/CandidateCancellationSettings/orders/${orderId}`
    );
  }

  public getAllShifts(): Observable<ScheduleShift[]> {
    return this.http.get<ScheduleShift[]>(`/api/MasterShifts/all`);
  }

  public sendCandidateOnboardEmail(payload: OnboardCandidateEmail): Observable<any> {
    const formData = new FormData();
    formData.append('file', payload?.stream != null ? payload?.stream : '');
    delete payload.stream;
    formData.append('content', JSON.stringify(payload))
    return this.http.post<any>(`/api/AppliedCandidates/candidateOnboardemail`, formData);
  }

  public getOrderAuditHistory(payload: AuditLogPayload): Observable<OrderAuditHistory[]> {
    return this.http.post<OrderAuditHistory[]>('/api/Audit/OrderAuditHistory', payload);
   }

   public getOrderCredentialAuditHistory(payload: AuditLogPayload): Observable<OrderCredentialAuditHistory[]> {
     return this.http.post<OrderCredentialAuditHistory[]>('/api/Audit/OrderCredentialAuditHistory', payload);
    }

    public getOrderBillRatesAuditHistory(payload: AuditLogPayload): Observable<OrderBillRateAuditHistory[]> {
     return this.http.post<OrderBillRateAuditHistory[]>('/api/Audit/OrderBillRateAuditHistory', payload);
    }

    public getOrderContactAuditHistory(payload: AuditLogPayload): Observable<OrderContactAuditHistory[]> {
     return this.http.post<OrderContactAuditHistory[]>('/api/Audit/OrderContactsAuditHistory', payload);
    }

    public GetOrderWorkLocationAuditHistory(payload: AuditLogPayload): Observable<OrderWorkLocationAuditHistory[]> {
     return this.http.post<OrderWorkLocationAuditHistory[]>('/api/Audit/OrderWorkLocationAuditHistory', payload);
    }

    public getOrderJobDistributionAuditHistory(payload: AuditLogPayload): Observable<OrderJobDistributionAuditHistory[]> {
     return this.http.post<OrderJobDistributionAuditHistory[]>('/api/Audit/OrderJobDistributionAuditHistory', payload);
    }

    public getOrderClassificationAuditHistory(payload: AuditLogPayload): Observable<OrderClassificationAuditHistory[]> {
     return this.http.post<OrderClassificationAuditHistory[]>('/api/Audit/OrderClassificationAuditHistory', payload);
    }

    public getJobDistributionValues(payload: JobDistributionfilters): Observable<OrgStructureDto> {
      return this.http.post<OrgStructureDto>('/api/OrganizationSettings/GetOrganizationDistributionvalue', payload);
     }

     public saveClearToStart(payload: clearToStartDataset): Observable<any> {
      return this.http.post<clearToStartDataset>('/api/AppliedCandidates/UpdateClearToStart', payload);
     }
}
