import { Action, Selector, State, StateContext } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { getAllErrors } from "@shared/utils/error.utils";
import { catchError, Observable, of, tap } from 'rxjs';
import {
  ApproveOrder,
  ClearPredefinedBillRates,
  ClearSelectedOrder,
  DeleteOrder,
  DeleteOrderSucceeded,
  EditOrder,
  GetAgencyOrderCandidatesList,
  GetAssociateAgencies,
  GetAvailableSteps,
  GetIncompleteOrders,
  GetMasterShifts,
  GetOrderById,
  GetOrderFIlterDataSources,
  GetOrders,
  GetOrganisationCandidateJob,
  GetOrganizationStatesWithKeyCode,
  GetPredefinedBillRates,
  GetProjectNames,
  GetProjectSpecialData,
  GetProjectTypes,
  GetRejectReasonsForOrganisation,
  GetSelectedOrderById,
  GetSuggestedDetails,
  GetWorkflows,
  RejectCandidateForOrganisationSuccess,
  RejectCandidateJob,
  SaveOrder,
  SaveOrderSucceeded,
  SetIsDirtyOrderForm,
  SetPredefinedBillRatesData,
  UpdateOrganisationCandidateJob,
  UpdateOrganisationCandidateJobSucceed,
  GetHistoricalData,
  GetReOrders
} from '@client/store/order-managment-content.actions';
import { OrderManagementContentService } from '@shared/services/order-management-content.service';
import {
  ApplicantStatus,
  GetPredefinedBillRatesData,
  Order,
  OrderCandidateJob,
  OrderCandidatesListPage,
  OrderFilterDataSource,
  OrderManagement,
  OrderManagementPage,
  SuggesstedDetails
} from '@shared/models/order-management.model';
import { DialogNextPreviousOption } from '@shared/components/dialog-next-previous/dialog-next-previous.component';
import { OrganizationStateWithKeyCode } from '@shared/models/organization-state-with-key-code.model';
import { WorkflowByDepartmentAndSkill } from '@shared/models/workflow-mapping.model';
import { ProjectName, ProjectType } from '@shared/models/project.model';
import { MasterShift } from '@shared/models/master-shift.model';
import { AssociateAgency } from '@shared/models/associate-agency.model';
import { ProjectsService } from '@shared/services/projects.service';
import { ShiftsService } from '@shared/services/shift.service';
import { ShowToast } from 'src/app/store/app.actions';
import { MessageTypes } from '@shared/enums/message-types';
import { RECORD_ADDED, RECORD_MODIFIED } from '@shared/constants';
import { getGroupedCredentials } from '@shared/components/order-details/order.utils';
import { BillRate } from '@shared/models/bill-rate.model';
import { OrderManagementModel } from '@agency/store/order-management.state';
import { ProjectSpecialData } from '@shared/models/project-special-data.model';
import { RejectReasonService } from "@shared/services/reject-reason.service";
import { RejectReason, RejectReasonPage } from "@shared/models/reject-reason.model";
import { HistoricalEvent } from '@shared/models/historical-event.model';

export interface OrderManagementContentStateModel {
  ordersPage: OrderManagementPage | null;
  selectedOrder: Order | null;
  candidatesJob: OrderCandidateJob | null;
  applicantStatuses: ApplicantStatus[];
  orderCandidatesListPage: OrderCandidatesListPage | null;
  orderDialogOptions: {
    next: boolean,
    previous: boolean
  },
  getPredefinedBillRatesData: GetPredefinedBillRatesData | null;
  organizationStatesWithKeyCode: OrganizationStateWithKeyCode[];
  workflows: WorkflowByDepartmentAndSkill[];
  projectTypes: ProjectType[];
  projectSpecialData: ProjectSpecialData | null;
  suggestedDetails: SuggesstedDetails | null;
  projectNames: ProjectName[];
  masterShifts: MasterShift[];
  associateAgencies: AssociateAgency[];
  predefinedBillRates: BillRate[];
  isDirtyOrderForm: boolean;
  rejectionReasonsList: RejectReason[] | null;
  orderFilterDataSources: OrderFilterDataSource | null;
  historicalEvents: HistoricalEvent[] | null
}

@State<OrderManagementContentStateModel>({
  name: 'orderManagement',
  defaults: {
    ordersPage: null,
    selectedOrder: null,
    orderCandidatesListPage: null,
    candidatesJob: null,
    applicantStatuses: [],
    orderDialogOptions: {
      next: false,
      previous: false
    },
    getPredefinedBillRatesData: null,
    organizationStatesWithKeyCode: [],
    workflows: [],
    projectTypes: [],
    projectNames: [],
    projectSpecialData: null,
    suggestedDetails: null,
    masterShifts: [],
    associateAgencies: [],
    predefinedBillRates: [],
    isDirtyOrderForm: false,
    rejectionReasonsList: null,
    orderFilterDataSources: null,
    historicalEvents: null
  }
})
@Injectable()
export class OrderManagementContentState {
  @Selector()
  static ordersPage(state: OrderManagementContentStateModel): OrderManagementPage | null {
    return state.ordersPage;
  }

  @Selector()
  static selectedOrder(state: OrderManagementContentStateModel): Order | null {
    return state.selectedOrder;
  }

  @Selector()
  static orderDialogOptions(state: OrderManagementContentStateModel): DialogNextPreviousOption {
    return state.orderDialogOptions;
  }

  @Selector()
  static orderCandidatePage(state: OrderManagementContentStateModel): OrderCandidatesListPage | null {
    return state.orderCandidatesListPage;
  }

  @Selector()
  static organizationStatesWithKeyCode(state: OrderManagementContentStateModel): OrganizationStateWithKeyCode[] {
    return state.organizationStatesWithKeyCode;
  }

  @Selector()
  static workflows(state: OrderManagementContentStateModel): WorkflowByDepartmentAndSkill[] {
    return state.workflows;
  }

  @Selector()
  static projectTypes(state: OrderManagementContentStateModel): ProjectType[] {
    return state.projectTypes
  }

  @Selector()
  static projectSpecialData(state: OrderManagementContentStateModel): ProjectSpecialData | null {
    return state.projectSpecialData
  }

  @Selector()
  static suggestedDetails(state: OrderManagementContentStateModel): SuggesstedDetails | null {
    return state.suggestedDetails
  }

  @Selector()
  static projectNames(state: OrderManagementContentStateModel): ProjectName[] {
    return state.projectNames
  }

  @Selector()
  static masterShifts(state: OrderManagementContentStateModel): MasterShift[] {
    return state.masterShifts
  }

  @Selector()
  static associateAgencies(state: OrderManagementContentStateModel): AssociateAgency[] {
    return state.associateAgencies
  }

  @Selector()
  static getPredefinedBillRatesData(state: OrderManagementContentStateModel): GetPredefinedBillRatesData | null {
    return state.getPredefinedBillRatesData
  }

  @Selector()
  static predefinedBillRates(state: OrderManagementContentStateModel): BillRate[] {
    return state.predefinedBillRates
  }

  @Selector()
  static isDirtyOrderForm(state: OrderManagementContentStateModel): boolean {
    return state.isDirtyOrderForm;
  }

  @Selector()
  static candidatesJob(state: OrderManagementContentStateModel): OrderCandidateJob | null {
    return state.candidatesJob;
  }

  @Selector()
  static applicantStatuses(state: OrderManagementContentStateModel): ApplicantStatus[] {
    return state.applicantStatuses;
  }

  @Selector()
  static lastSelectedOrder(state: OrderManagementContentStateModel): (id: number) => [OrderManagement, number] | [] {
    return (id: number) => {
      let rowIndex;
      const order = state.ordersPage?.items.find((order, index) => {
        rowIndex = index;
        return order.id === id;
      });
      return order && rowIndex ? [order, rowIndex] : [];
    };
  }

  @Selector()
  static rejectionReasonsList(state: OrderManagementContentStateModel): RejectReason[] | null {
    return state.rejectionReasonsList
  }

  @Selector()
  static orderFilterDataSources(state: OrderManagementContentStateModel): OrderFilterDataSource | null {
    return state.orderFilterDataSources
  }

  @Selector()
  static candidateHistoricalData(state: OrderManagementContentStateModel) {
    return state.historicalEvents
  }

  constructor(
    private orderManagementService: OrderManagementContentService,
    private projectsService: ProjectsService,
    private shiftsService: ShiftsService,
    private rejectReasonService: RejectReasonService,
  ) {
  }

  @Action(GetIncompleteOrders)
  GetIncompleteOrders({ patchState }: StateContext<OrderManagementContentStateModel>, { payload }: GetIncompleteOrders): Observable<OrderManagementPage> {
    return this.orderManagementService.getIncompleteOrders(payload).pipe(tap((payload) => {
      patchState({ ordersPage: payload });
    }));
  }

  @Action(GetOrders)
  GetOrders({ patchState }: StateContext<OrderManagementContentStateModel>, { payload }: GetOrders): Observable<OrderManagementPage> {
    return this.orderManagementService.getOrders(payload).pipe(tap((payload) => {
      patchState({ ordersPage: payload });
      return payload;
    }));
  }

  @Action(GetOrderById)
  GetOrderById(
    { patchState }: StateContext<OrderManagementContentStateModel>,
    { id, options }: GetOrderById
  ): Observable<Order> {
    patchState({ orderDialogOptions: options });
    return this.orderManagementService.getOrderById(id).pipe(
      tap((payload) => {
        const groupedCredentials = getGroupedCredentials(payload.credentials)
        payload.groupedCredentials = groupedCredentials;
        patchState({ selectedOrder: payload });
        return payload;
      })
    );
  }

  @Action(GetReOrders)
  GetReOrders({ patchState }: StateContext<OrderManagementContentStateModel>, { payload }: GetReOrders): Observable<OrderManagementPage> {
    return this.orderManagementService.getReOrders(payload).pipe(tap((payload) => {
      patchState({ ordersPage: payload });
      return payload;
    }));
  }

  @Action(GetAgencyOrderCandidatesList)
  GetAgencyOrderCandidatesPage(
    { patchState }: StateContext<OrderManagementContentStateModel>,
    { orderId, organizationId, pageNumber, pageSize }: GetAgencyOrderCandidatesList
  ): Observable<OrderCandidatesListPage> {
    return this.orderManagementService.getOrderCandidatesList(orderId, organizationId, pageNumber, pageSize).pipe(
      tap((payload) => {
        patchState({ orderCandidatesListPage: payload });
        return payload
      })
    )
  }

  @Action(GetSelectedOrderById)
  GetSelectedOrderById({ patchState }: StateContext<OrderManagementContentStateModel>, { payload }: GetSelectedOrderById): Observable<Order> {
    return this.orderManagementService.getOrderById(payload).pipe(tap((payload) => {
      patchState({ selectedOrder: payload });
      return payload;
    }));
  }

  @Action(ClearSelectedOrder)
  ClearSelectedOrder({ patchState }: StateContext<OrderManagementContentStateModel>): void {
    patchState({ selectedOrder: null });
  }

  @Action(GetOrganizationStatesWithKeyCode)
  GetOrganizationStatesWithKeyCode({ patchState }: StateContext<OrderManagementContentStateModel>): Observable<OrganizationStateWithKeyCode[]> {
    return this.orderManagementService.getOrganizationStatesWitKeyCode().pipe(tap((payload) => {
      patchState({ organizationStatesWithKeyCode: payload });
      return payload;
    }));
  }

  @Action(GetOrganisationCandidateJob)
  GetOrganisationCandidateJob(
    { patchState }: StateContext<OrderManagementContentStateModel>,
    { organizationId, jobId }: GetOrganisationCandidateJob
  ): Observable<OrderCandidateJob> {
    return this.orderManagementService.getCandidateJob(organizationId, jobId).pipe(
      tap((payload) => {
        patchState({ candidatesJob: payload });
        return payload;
      })
    );
  }

  @Action(GetAvailableSteps)
  GetAvailableSteps(
    { patchState }: StateContext<OrderManagementContentStateModel>,
    { organizationId, jobId }: GetAvailableSteps
  ): Observable<ApplicantStatus[]> {
    return this.orderManagementService.getAvailableSteps(organizationId, jobId).pipe(
      tap((payload) => {
        patchState({ applicantStatuses: payload });
        return payload;
      })
    );
  }

  @Action(UpdateOrganisationCandidateJob)
  UpdateOrganisationCandidateJob({ dispatch }: StateContext<OrderManagementModel>, { payload }: UpdateOrganisationCandidateJob): Observable<any> {
    return this.orderManagementService.updateCandidateJob(payload).pipe(
      tap(() => {
        dispatch(new ShowToast(MessageTypes.Success, 'Candidate was updated'));
        dispatch(new UpdateOrganisationCandidateJobSucceed());
      }),
      catchError((error: any) => {
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)))
      })
    );
  }

  @Action(GetWorkflows)
  GetWorkflows({ patchState }: StateContext<OrderManagementContentStateModel>, {
    departmentId,
    skillId
  }: GetWorkflows): Observable<WorkflowByDepartmentAndSkill[]> {
    return this.orderManagementService.getWorkflowsByDepartmentAndSkill(departmentId, skillId).pipe(tap((payload) => {
      patchState({ workflows: payload });
      return payload;
    }));
  }

  @Action(GetProjectTypes)
  GetProjectTypes({ patchState }: StateContext<OrderManagementContentStateModel>): Observable<ProjectType[]> {
    return this.projectsService.getProjectTypes().pipe(tap(payload => {
      patchState({ projectTypes: payload });
    }));
  }

  @Action(GetProjectSpecialData)
  GetProjectSpecialData({ patchState }: StateContext<OrderManagementContentStateModel>): Observable<ProjectSpecialData> {
    return this.projectsService.getProjectSpecialData().pipe(tap(payload => {
      patchState({ projectSpecialData: payload });
    }));
  }

  @Action(GetSuggestedDetails)
  GetSuggestedDetails({ patchState }: StateContext<OrderManagementContentStateModel>, { locationId }: GetSuggestedDetails): Observable<SuggesstedDetails> {
    return this.orderManagementService.getSuggestedDetails(locationId).pipe(tap(payload => {
      patchState({ suggestedDetails: payload });
    }));
  }

  @Action(GetProjectNames)
  GetProjectNames({ patchState }: StateContext<OrderManagementContentStateModel>): Observable<ProjectName[]> {
    return this.projectsService.getProjectNames().pipe(tap(payload => {
      patchState({ projectNames: payload });
    }));
  }

  @Action(GetMasterShifts)
  GetMasterShifts({ patchState }: StateContext<OrderManagementContentStateModel>): Observable<MasterShift[]> {
    return this.shiftsService.getAllMasterShifts().pipe(tap(payload => {
      patchState({ masterShifts: payload });
    }));
  }

  @Action(GetAssociateAgencies)
  GetAssociateAgencies({ patchState }: StateContext<OrderManagementContentStateModel>): Observable<AssociateAgency[]> {
    return this.orderManagementService.getAssociateAgencies().pipe(tap(payload => {
      patchState({ associateAgencies: payload });
    }));
  }

  @Action(SetPredefinedBillRatesData)
  SetPredefinedBillRatesData(
    { patchState }: StateContext<OrderManagementContentStateModel>,
    { orderType, departmentId, skillId }: SetPredefinedBillRatesData
  ): void {
    patchState({ getPredefinedBillRatesData: { orderType, departmentId, skillId } });
  }

  @Action(GetPredefinedBillRates)
  GetPredefinedBillRates({ patchState, getState }: StateContext<OrderManagementContentStateModel>): Observable<BillRate[]> {
    const state = getState();
    const getPredefinedBillRatesData = state.getPredefinedBillRatesData;

    if (getPredefinedBillRatesData) {
      const { orderType, departmentId, skillId } = getPredefinedBillRatesData;
      return this.orderManagementService.getPredefinedBillRates(orderType, departmentId, skillId).pipe(tap(payload => {
        patchState({ predefinedBillRates: payload });
        return payload;
      }));
    } else {
      patchState({ predefinedBillRates: [] });
      return of([]);
    }
  }

  @Action(ClearPredefinedBillRates)
  ClearPredefinedBillRates({ patchState }: StateContext<OrderManagementContentStateModel>): void {
    patchState({
      getPredefinedBillRatesData: null,
      predefinedBillRates: []
    });
  }

  @Action(SetIsDirtyOrderForm)
  SetIsDirtyOrderForm({ patchState }: StateContext<OrderManagementContentStateModel>, { isDirtyOrderForm }: SetIsDirtyOrderForm): void {
    patchState({ isDirtyOrderForm });
  }

  @Action(SaveOrder)
  SaveOrder({ dispatch }: StateContext<OrderManagementContentStateModel>, { order, documents }: SaveOrder): Observable<Order | void> {
    return this.orderManagementService.saveOrder(order, documents).pipe(
      tap(order => {
        dispatch([
          new ShowToast(MessageTypes.Success, RECORD_ADDED),
          new SaveOrderSucceeded(),
          new SetIsDirtyOrderForm(false)
        ]);
        return order;
      }),
      catchError(error => dispatch(new ShowToast(MessageTypes.Error, error.error.detail)))
    );
  }

  @Action(EditOrder)
  EditOrder({ dispatch }: StateContext<OrderManagementContentStateModel>, { order, documents }: EditOrder): Observable<Order | void> {
    return this.orderManagementService.editOrder(order, documents).pipe(
      tap(order => {
        dispatch([
          new ShowToast(MessageTypes.Success, RECORD_MODIFIED),
          new SaveOrderSucceeded(),
          new SetIsDirtyOrderForm(false)
        ]);
        return order;
      }),
      catchError(error => dispatch(new ShowToast(MessageTypes.Error, error.error.detail)))
    );
  }

  @Action(DeleteOrder)
  DeleteOrder({ dispatch }: StateContext<OrderManagementContentStateModel>, { id }: DeleteOrder): Observable<any> {
    return this.orderManagementService.deleteOrder(id).pipe(tap(() => {
        dispatch(new DeleteOrderSucceeded());
      }),
      catchError((error: any) => of(dispatch(new ShowToast(MessageTypes.Error, 'Order cannot be deleted')))));
  }

  @Action(GetRejectReasonsForOrganisation)
  GetRejectReasonsForOrganisation(
    { patchState }: StateContext<OrderManagementContentStateModel>
  ): Observable<RejectReasonPage> {
    return this.rejectReasonService.getAllRejectReasons().pipe(
      tap(reasons => {
        patchState({ rejectionReasonsList: reasons.items });
        return reasons;
      })
    )
  }

  @Action(RejectCandidateJob)
  RejectCandidateJob(
    { dispatch }: StateContext<OrderManagementContentStateModel>,
    { payload }: RejectCandidateJob
  ): Observable<void> {
    return this.orderManagementService.rejectCandidateJob(payload).pipe(
      tap(() => {
        dispatch([
          new ShowToast(MessageTypes.Success, RECORD_MODIFIED),
          new RejectCandidateForOrganisationSuccess()
        ]);
      })
    )
  }

  @Action(ApproveOrder)
  ApproveOrder({ dispatch }: StateContext<OrderManagementContentStateModel>, { id }: ApproveOrder): Observable<string | void> {
    return this.orderManagementService.approveOrder(id).pipe(
      catchError(error => dispatch(new ShowToast(MessageTypes.Error, error.error)))
    );
  }

  @Action(GetOrderFIlterDataSources)
  GetOrderFIlterDataSources(
    { patchState }: StateContext<OrderManagementContentStateModel>
  ): Observable<OrderFilterDataSource> {
    return this.orderManagementService.getOrderFilterDataSources().pipe(
      tap(payload => {
        patchState({ orderFilterDataSources: payload });
        return payload;
      })
    )
  }

  @Action(GetHistoricalData)
  GetHistoricalData(
    {patchState}: StateContext<OrderManagementContentStateModel>,
    {organizationId, candidateJobId}: GetHistoricalData
  ): Observable<HistoricalEvent[]> {
    return this.orderManagementService.getHistoricalData(organizationId, candidateJobId).pipe(
      tap((payload: HistoricalEvent[]) => {
        patchState({historicalEvents: payload})
        return payload
      }),
      catchError(()=> {
        patchState({historicalEvents: []})
        return of()
      })
    )
  }
}
