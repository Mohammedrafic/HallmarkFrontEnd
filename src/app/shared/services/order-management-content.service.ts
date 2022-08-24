import { Injectable } from '@angular/core';
import { map, Observable, switchMap, tap } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  AcceptJobDTO,
  AgencyOrderFilters,
  AgencyOrderManagement,
  AgencyOrderManagementPage,
  ApplicantStatus,
  CandidatesBasicInfo,
  CreateOrderDto,
  EditOrderDto,
  Order,
  OrderCandidateJob,
  OrderCandidatesListPage,
  OrderFilterDataSource,
  OrderManagement,
  OrderManagementFilter,
  OrderManagementPage,
  SuggestedDetails,
} from '@shared/models/order-management.model';
import { OrganizationStateWithKeyCode } from '@shared/models/organization-state-with-key-code.model';
import { WorkflowByDepartmentAndSkill } from '@shared/models/workflow-mapping.model';
import { AssociateAgency } from '@shared/models/associate-agency.model';
import { OrderType } from '@shared/enums/order-type';
import { BillRate } from '@shared/models/bill-rate.model';
import { RejectReasonPayload } from '@shared/models/reject-reason.model';
import { HistoricalEvent } from '../models/historical-event.model';
import { ExportPayload } from '@shared/models/export.model';
import { AgencyOrderManagementTabs, OrganizationOrderManagementTabs } from '@shared/enums/order-management-tabs.enum';
import { Comment } from '@shared/models/comment.model';

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

  /**
   * Lock/Unlock the order
   */
  public setLock(orderId: number, lockStatus: boolean): Observable<boolean> {
    return this.http.post<boolean>(`/api/Orders/setLock`, { orderId, lockStatus });
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
    excludeDeployed?: boolean
  ): Observable<OrderCandidatesListPage> {
    let params: any = {
      PageNumber: pageNumber,
      PageSize: pageSize,
    };

    if (excludeDeployed) {
      params = { ...params, excludeDeployed };
    }
    return this.http.get<OrderCandidatesListPage>(
      `/api/CandidateProfile/order/${orderId}/organization/${organizationId}`,
      { params }
    );
  }

  /**
   * Get the agency orders information
   @param id
   @param organizationId
   */
  public getAgencyOrderGeneralInformation(id: number, organizationId: number): Observable<Order> {
    return this.http.get<Order>(`/api/Orders/${id}/organization/${organizationId}`);
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
   @param payload
   */
  public updateCandidateJob(payload: AcceptJobDTO): Observable<void> {
    return this.http.post<void>(`/api/AppliedCandidates/updateCandidateJob`, payload);
  }

  /**
   * Get available steps
   @param organizationId
   @param jobId
   */
  public getAvailableSteps(organizationId: number, jobId: number): Observable<ApplicantStatus[]> {
    return this.http.get<ApplicantStatus[]>(
      `/api/AppliedCandidates/availableSteps?OrganizationId=${organizationId}&JobId=${jobId}`
    );
  }

  /**
   * Get order by id
   @param id
   */
  public getOrderById(id: number): Observable<Order> {
    return this.http.get<Order>(`/api/Orders/${id}`);
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
    excludeDeployed?: boolean
  ): Observable<OrderCandidatesListPage> {
    let params: any = {
      PageNumber: pageNumber,
      PageSize: pageSize,
    };

    if (excludeDeployed) {
      params = { ...params, excludeDeployed };
    }
    return this.http.get<OrderCandidatesListPage>(`/api/CandidateProfile/order/${orderId}`, {
      params,
    });
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
  public getAssociateAgencies(): Observable<AssociateAgency[]> {
    return this.http.get<AssociateAgency[]>('/api/AssociateAgencies');
  }

  /**
   * Get predefined bill rates for order by order type, department id and skill id
   * @param orderType
   * @param departmentId
   * @param skillId
   * @returns list of predefined bill rates
   */
  public getPredefinedBillRates(orderType: OrderType, departmentId: number, skillId: number): Observable<BillRate[]> {
    const params = new HttpParams()
      .append('orderType', orderType)
      .append('departmentId', departmentId)
      .append('skillId', skillId);

    return this.http.get<BillRate[]>('/api/BillRates/predefined/forOrder', { params })
    .pipe(
      map((items) => items.map((rate) => {
        return ({
          ...rate,
          IsPredefined: true,
        })
      } ))
    )
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
  public saveOrder(order: CreateOrderDto, documents: Blob[], comments: Comment[] | undefined): Observable<Order> {
    return this.http.post<Order>('/api/Orders', order).pipe(
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

  /**
   * Edit order
   * @param order object to edit
   * @return edited order
   */
  public editOrder(order: EditOrderDto, documents: Blob[]): Observable<Order> {
    return this.http.put<Order>('/api/Orders', order).pipe(
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

  /**
   * Approve order
   * @param id order id to approve
   */
  public approveOrder(id: number): Observable<string> {
    return this.http.post(`/api/Order/approve`, { orderId: id }, { responseType: 'text' });
  }

  /**
   * Reject Candidate Job
   * @param payload
   */
  public rejectCandidateJob(payload: RejectReasonPayload): Observable<void> {
    return this.http.post<void>('/api/AppliedCandidates/rejectCandidateJob', payload);
  }

  /**
   * Get order filter data sources
   */
  public getOrderFilterDataSources(): Observable<OrderFilterDataSource> {
    return this.http.get<OrderFilterDataSource>('/api/OrdersFilteringOptions/organization');
  }

  /**
   * Get the historical data for candidate
   * @return Array of historical events
   */
  public getHistoricalData(organizationId: number, jobId: number): Observable<HistoricalEvent[]> {
    return this.http.get<HistoricalEvent[]>(
      `/api/AppliedCandidates/historicalData?OrganizationId=${organizationId}&CandidateJobId=${jobId}`
    );
  }

  /**
   * Get basic info about candidate
   @param organizationId
   @param jobId
   */
  public getCandidatesBasicInfo(organizationId: number, jobId: number): Observable<CandidatesBasicInfo> {
    return this.http.get<CandidatesBasicInfo>(
      `/api/AppliedCandidates/basicInfo?OrganizationId=${organizationId}&JobId=${jobId}`
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
   * Export agency list
   * @param payload
   * @param tab
   */
  public exportAgency(payload: ExportPayload, tab: AgencyOrderManagementTabs): Observable<any> {
    switch (tab) {
      case AgencyOrderManagementTabs.ReOrders:
        return this.http.post(`/api/Agency/ReOrders/export`, payload, { responseType: 'blob' }); // TODO: modification pending after BE implementation
      case AgencyOrderManagementTabs.MyAgency:
        return this.http.post(`/api/agency/orders/export`, payload, { responseType: 'blob' });
      case AgencyOrderManagementTabs.PerDiem:
        return this.http.post(`/api/agency/orders/perdiem/export`, payload, { responseType: 'blob' });
      default:
        return this.http.post(`/api/Agency/export`, payload, { responseType: 'blob' });
    }
  }

  /**
   * Duplicate order by id
   * @param payload order id to duplicate
   * @return id of newly created order
   */
  public duplicate(payload: number): Observable<number> {
    return this.http.post<number>(`/api/Orders/${payload}/duplicate`, {});
  }

  public getRegularLocalBillRate(orderType: OrderType, departmentId: number, skillId: number): Observable<BillRate[]> {
    return this.http.get<BillRate[]>('/api/billrates/regular/fororder', { params: { orderType, departmentId, skillId } });
  }
}
