import { Injectable } from '@angular/core';
import { map, Observable, switchMap } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  OrderManagementFilter,
  OrderManagementPage,
  AgencyOrderManagementPage,
  OrderCandidatesListPage,
  OrderCandidateJob,
  AcceptJobDTO,
  ApplicantStatus,
  SuggesstedDetails
} from '@shared/models/order-management.model';
import { CreateOrderDto, EditOrderDto, Order } from '@shared/models/order-management.model';
import { OrganizationStateWithKeyCode } from '@shared/models/organization-state-with-key-code.model';
import { WorkflowByDepartmentAndSkill } from '@shared/models/workflow-mapping.model';
import { AssociateAgency } from '@shared/models/associate-agency.model';
import { OrderType } from '@shared/enums/order-type';
import { BillRate } from '@shared/models/bill-rate.model';

@Injectable({ providedIn: 'root' })
export class OrderManagementContentService {
  constructor(private http: HttpClient) { }

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
   * Get the agency orders
   @param pageNumber
   @param pageSize
   */
  public getAgencyOrders(pageNumber: number, pageSize: number /** TODO: Add filter params */): Observable<AgencyOrderManagementPage> {
    return this.http.get<AgencyOrderManagementPage>(`/api/Orders/agencyOrders`, { params: { PageNumber: pageNumber, PageSize: pageSize }});
  }

  /**
   * Get the agency order candidates
   @param orderId
   @param organizationId
   @param pageNumber
   @param pageSize
   */
  public getAgencyOrderCandidatesList(orderId: number, organizationId: number, pageNumber: number, pageSize: number ): Observable<OrderCandidatesListPage> {
    return this.http.get<OrderCandidatesListPage>(`/api/CandidateProfile/order/${orderId}/organization/${organizationId}`, { params: { PageNumber: pageNumber, PageSize: pageSize }});
  }

  /**
   * Get the agency orders information
   @param id
   @param organizationId
   */
  public getAgencyOrderGeneralInformation(id: number, organizationId: number ): Observable<Order> {
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
    return this.http.get<OrderCandidateJob>(`/api/AppliedCandidates/candidateJob?OrganizationId=${organizationId}&JobId=${jobId}`);
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
    return this.http.get<ApplicantStatus[]>(`/api/AppliedCandidates/availableSteps?OrganizationId=${organizationId}&JobId=${jobId}`);
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
  public getOrderCandidatesList(orderId: number, organizationId: number, pageNumber: number, pageSize: number ): Observable<OrderCandidatesListPage> {
    return this.http.get<OrderCandidatesListPage>(`/api/CandidateProfile/order/${orderId}`, { params: { PageNumber: pageNumber, PageSize: pageSize }});
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
  public getWorkflowsByDepartmentAndSkill(departmentId: number, skillId: number): Observable<WorkflowByDepartmentAndSkill[]> {
    return this.http.get<WorkflowByDepartmentAndSkill[]>(`/api/WorkflowMapping/department/${departmentId}/skill/${skillId}`);
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

    return this.http.get<BillRate[]>('/api/BillRates/predefined/forOrder', { params });
  }

  /**
   * Get workLocation and contactDetails based on location
   * @param locationId
   * @returns suggessted details data
   */
  public getSuggestedDetails(locationId: number | string): Observable<SuggesstedDetails> {
    return this.http.get<SuggesstedDetails>(`/api/Orders/suggestedDetails/${locationId}`);
  }

  /**
   * Create order
   * @param order object to save
   * @param documents array of attached documents
   * @return saved order
   */
  public saveOrder(order: CreateOrderDto, documents: Blob[]): Observable<Order> {
    return this.http.post<Order>('/api/Orders', order).pipe(switchMap(createdOrder => {
      const formData = new FormData();
      documents.forEach(document => formData.append('documents', document));
      return this.http.post(`/api/Orders/${createdOrder.id}/documents`, formData).pipe(map(() => createdOrder));
    }));
  }

  /**
   * Edit order
   * @param order object to edit
   * @return edited order
   */
  public editOrder(order: EditOrderDto, documents: Blob[]): Observable<Order> {
    return this.http.put<Order>('/api/Orders', order).pipe(switchMap(editedOrder => {
      const formData = new FormData();
      documents.forEach(document => formData.append('documents', document));
      return this.http.post(`/api/Orders/${editedOrder.id}/documents`, formData).pipe(map(() => editedOrder));
    }));
  }

  /**
   * Edit order
   * @param id order id to delete
   */
  public deleteOrder(id: number): Observable<any> {
    return this.http.delete<Order>('/api/Orders', { params: { orderId: id }});
  }
}
