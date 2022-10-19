import { SaveLastSelectedOrganizationAgencyId } from './../../store/user.actions';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { getAllErrors } from '@shared/utils/error.utils';
import { catchError, debounceTime, Observable, of, tap } from 'rxjs';
import {
  ApproveOrder,
  CancelOrganizationCandidateJob,
  CancelOrganizationCandidateJobSuccess,
  ClearHistoricalData,
  ClearOrderCandidatePage,
  ClearOrders,
  ClearPredefinedBillRates,
  ClearSelectedOrder,
  ClearSuggestions,
  DeleteOrder,
  DeleteOrderSucceeded,
  DuplicateOrder,
  DuplicateOrderSuccess,
  EditOrder,
  ExportOrders,
  GetAgencyOrderCandidatesList,
  GetAssociateAgencies,
  GetAvailableSteps,
  GetContactDetails,
  GetHistoricalData,
  GetOrderById,
  GetOrderByIdSucceeded,
  GetOrderFilterDataSources,
  GetOrders,
  GetOrganisationCandidateJob,
  GetOrganizationExtensions,
  GetOrganizationStatesWithKeyCode,
  GetPredefinedBillRates,
  GetProjectNames,
  GetProjectSpecialData,
  GetProjectTypes,
  GetRejectReasonsForOrganisation,
  GetSelectedOrderById,
  GetSuggestedDetails,
  GetWorkflows,
  LockUpdatedSuccessfully,
  RejectCandidateForOrganisationSuccess,
  RejectCandidateJob,
  SaveOrder,
  SaveOrderSucceeded,
  SelectNavigationTab,
  SetIsDirtyOrderForm,
  SetIsDirtyQuickOrderForm,
  SetLock,
  SetPredefinedBillRatesData,
  UpdateOrganisationCandidateJob,
  UpdateOrganisationCandidateJobSucceed,
} from '@client/store/order-managment-content.actions';
import { OrderManagementContentService } from '@shared/services/order-management-content.service';
import {
  ApplicantStatus,
  CandidatesBasicInfo,
  GetPredefinedBillRatesData,
  Order,
  OrderCandidateJob,
  OrderCandidatesListPage,
  OrderFilterDataSource,
  OrderManagement,
  OrderManagementPage,
  SuggestedDetails,
} from '@shared/models/order-management.model';
import { DialogNextPreviousOption } from '@shared/components/dialog-next-previous/dialog-next-previous.component';
import { OrganizationStateWithKeyCode } from '@shared/models/organization-state-with-key-code.model';
import { WorkflowByDepartmentAndSkill } from '@shared/models/workflow-mapping.model';
import { ProjectName, ProjectType } from '@shared/models/project.model';
import { AssociateAgency } from '@shared/models/associate-agency.model';
import { ProjectsService } from '@shared/services/projects.service';
import { ShowToast } from 'src/app/store/app.actions';
import { MessageTypes } from '@shared/enums/message-types';
import {
  ORDER_WITHOUT_BILLRATES,
  ORDER_WITHOUT_CRED_BILLRATES,
  ORDER_WITHOUT_CREDENTIALS,
  RECORD_ADDED,
  RECORD_MODIFIED,
  updateCandidateJobMessage,
} from '@shared/constants';
import { getGroupedCredentials } from '@shared/components/order-details/order.utils';
import { BillRate, BillRateOption } from '@shared/models/bill-rate.model';
import { OrderManagementModel } from '@agency/store/order-management.state';
import { ProjectSpecialData } from '@shared/models/project-special-data.model';
import { RejectReasonService } from '@shared/services/reject-reason.service';
import { RejectReason, RejectReasonPage } from '@shared/models/reject-reason.model';
import { HistoricalEvent } from '@shared/models/historical-event.model';
import { GetCandidatesBasicInfo } from '@agency/store/order-management.actions';
import { saveSpreadSheetDocument } from '@shared/utils/file.utils';
import { NavigationTabModel } from '@shared/models/navigation-tab.model';
import { DepartmentsService } from '@shared/services/departments.service';
import { Department } from '@shared/models/department.model';
import { ExtensionSidebarService } from '@shared/components/extension/extension-sidebar/extension-sidebar.service';
import { ExtensionGridModel } from '@shared/components/extension/extension-sidebar/models/extension.model';
import { OrderType } from '@shared/enums/order-type';
import { createUniqHashObj } from '@core/helpers/functions.helper';
import { DateTimeHelper } from '@core/helpers';

export interface OrderManagementContentStateModel {
  ordersPage: OrderManagementPage | null;
  selectedOrder: Order | null;
  candidatesJob: OrderCandidateJob | null;
  candidatesBasicInfo: CandidatesBasicInfo | null;
  applicantStatuses: ApplicantStatus[];
  orderCandidatesListPage: OrderCandidatesListPage | null;
  orderDialogOptions: {
    next: boolean;
    previous: boolean;
  };
  getPredefinedBillRatesData: GetPredefinedBillRatesData | null;
  organizationStatesWithKeyCode: OrganizationStateWithKeyCode[];
  workflows: WorkflowByDepartmentAndSkill[];
  projectTypes: ProjectType[];
  projectSpecialData: ProjectSpecialData | null;
  suggestedDetails: SuggestedDetails | null;
  projectNames: ProjectName[];
  associateAgencies: AssociateAgency[];
  predefinedBillRates: BillRate[];
  isDirtyOrderForm: boolean;
  isDirtyQuickOrderForm: boolean;
  rejectionReasonsList: RejectReason[] | null;
  orderFilterDataSources: OrderFilterDataSource | null;
  historicalEvents: HistoricalEvent[] | null;
  navigationTab: NavigationTabModel;
  contactDetails: Department | null;
  extensions: any;
}

@State<OrderManagementContentStateModel>({
  name: 'orderManagement',
  defaults: {
    ordersPage: null,
    selectedOrder: null,
    orderCandidatesListPage: null,
    candidatesJob: null,
    candidatesBasicInfo: null,
    applicantStatuses: [],
    orderDialogOptions: {
      next: false,
      previous: false,
    },
    getPredefinedBillRatesData: null,
    organizationStatesWithKeyCode: [],
    workflows: [],
    projectTypes: [],
    projectNames: [],
    projectSpecialData: null,
    suggestedDetails: null,
    associateAgencies: [],
    predefinedBillRates: [],
    isDirtyOrderForm: false,
    isDirtyQuickOrderForm: false,
    rejectionReasonsList: null,
    orderFilterDataSources: null,
    historicalEvents: [],
    navigationTab: {
      active: null,
      pending: null,
      current: null,
    },
    contactDetails: null,
    extensions: null,
  },
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
    return state.projectTypes;
  }

  @Selector()
  static projectSpecialData(state: OrderManagementContentStateModel): ProjectSpecialData | null {
    return state.projectSpecialData;
  }

  @Selector()
  static suggestedDetails(state: OrderManagementContentStateModel): SuggestedDetails | null {
    return state.suggestedDetails;
  }

  @Selector()
  static projectNames(state: OrderManagementContentStateModel): ProjectName[] {
    return state.projectNames;
  }

  @Selector()
  static associateAgencies(state: OrderManagementContentStateModel): AssociateAgency[] {
    return state.associateAgencies;
  }

  @Selector()
  static getPredefinedBillRatesData(state: OrderManagementContentStateModel): GetPredefinedBillRatesData | null {
    return state.getPredefinedBillRatesData;
  }

  @Selector()
  static predefinedBillRates(state: OrderManagementContentStateModel): BillRate[] {
    return state.predefinedBillRates;
  }

  @Selector()
  static predefinedBillRatesOptions(state: OrderManagementContentStateModel): BillRateOption[] {
    const uniqBillRatesHashObj = createUniqHashObj(
      state.predefinedBillRates,
      (el: BillRate) => el.billRateConfigId,
      (el: BillRate) => el.billRateConfig
    );

    return Object.values(uniqBillRatesHashObj).map((el: BillRateOption) => el);
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
  static lastSelectedOrder(
    state: OrderManagementContentStateModel
  ): (id: number) => [OrderManagement, number | undefined] | [] {
    return (id: number) => {
      let rowIndex;
      const order = state.ordersPage?.items.find((order, index) => {
        rowIndex = index;
        return order.id === id;
      });
      return order ? [order, rowIndex] : [];
    };
  }

  @Selector()
  static rejectionReasonsList(state: OrderManagementContentStateModel): RejectReason[] | null {
    return state.rejectionReasonsList;
  }

  @Selector()
  static orderFilterDataSources(state: OrderManagementContentStateModel): OrderFilterDataSource | null {
    return state.orderFilterDataSources;
  }

  @Selector()
  static candidateHistoricalData(state: OrderManagementContentStateModel): HistoricalEvent[] | null {
    return state.historicalEvents;
  }

  @Selector()
  static candidateBasicInfo(state: OrderManagementContentStateModel): CandidatesBasicInfo | null {
    return state.candidatesBasicInfo;
  }

  @Selector()
  static navigationTab(state: OrderManagementContentStateModel): any | null {
    return state.navigationTab;
  }

  @Selector()
  static contactDetails(state: OrderManagementContentStateModel): Department | null {
    return state.contactDetails;
  }

  @Selector()
  static extensions(state: OrderManagementContentStateModel): any | null {
    return state.extensions;
  }

  @Selector()
  static isDirtyQuickOrderForm(state: OrderManagementContentStateModel): boolean {
    return state.isDirtyQuickOrderForm;
  }

  constructor(
    private orderManagementService: OrderManagementContentService,
    private projectsService: ProjectsService,
    private departmentService: DepartmentsService,
    private rejectReasonService: RejectReasonService,
    private extensionSidebarService: ExtensionSidebarService
  ) {}

  @Action(GetOrders, { cancelUncompleted: true })
  GetOrders(
    { patchState }: StateContext<OrderManagementContentStateModel>,
    { payload, isIncomplete }: GetOrders
  ): Observable<OrderManagementPage> {
    patchState({ ordersPage: null });
    return !isIncomplete
      ? this.orderManagementService.getOrders(payload).pipe(
          tap((payload) => {
            this.orderManagementService.countShiftsWithinPeriod(payload);
            patchState({ ordersPage: payload });
            return payload;
          })
        )
      : this.orderManagementService.getIncompleteOrders(payload).pipe(
          tap((payload) => {
            patchState({ ordersPage: payload });
          })
        );
  }

  @Action(ClearOrders)
  ClearOrders(
    { patchState }: StateContext<OrderManagementContentStateModel>,
    {}: ClearOrders
  ): OrderManagementContentStateModel {
    return patchState({ ordersPage: null });
  }

  @Action(GetOrderById)
  GetOrderById(
    { patchState, dispatch }: StateContext<OrderManagementContentStateModel>,
    { id, options }: GetOrderById
  ): Observable<Order> {
    patchState({ orderDialogOptions: options });
    return this.orderManagementService.getOrderById(id).pipe(
      tap((payload) => {
        const groupedCredentials = getGroupedCredentials(payload.credentials ?? payload.reOrderFrom?.credentials);
        payload.groupedCredentials = groupedCredentials;
        patchState({ selectedOrder: payload });

        const { orderType, departmentId, skillId, jobStartDate, jobEndDate } = payload;

        dispatch(
          new SetPredefinedBillRatesData(
            orderType,
            departmentId,
            skillId,
            jobStartDate ? DateTimeHelper.toUtcFormat(jobStartDate) : jobStartDate,
            jobEndDate ? DateTimeHelper.toUtcFormat(jobEndDate) : jobEndDate
          )
        );
        
        dispatch(new GetOrderByIdSucceeded());
        return payload;
      })
    );
  }

  @Action(SetLock)
  SetLock(
    { dispatch }: StateContext<OrderManagementContentStateModel>,
    { id, lockStatus, filters, prefixId, updateOpened }: SetLock
  ): Observable<boolean | void> {
    return this.orderManagementService.setLock(id, lockStatus).pipe(
      tap(() => {
        const message = lockStatus ? `The Order ${prefixId} is locked` : `The Order ${prefixId} is unlocked`;
        const actions = [new LockUpdatedSuccessfully(), new ShowToast(MessageTypes.Success, message)];
        dispatch(updateOpened ? [...actions, new GetSelectedOrderById(id)] : actions);
      }),
      catchError((error) => dispatch(new ShowToast(MessageTypes.Error, error.error?.detail)))
    );
  }

  @Action(GetAgencyOrderCandidatesList)
  GetAgencyOrderCandidatesPage(
    { patchState }: StateContext<OrderManagementContentStateModel>,
    { orderId, organizationId, pageNumber, pageSize, excludeDeployed }: GetAgencyOrderCandidatesList
  ): Observable<OrderCandidatesListPage> {
    return this.orderManagementService
      .getOrderCandidatesList(orderId, organizationId, pageNumber, pageSize, excludeDeployed)
      .pipe(
        tap((payload) => {
          patchState({ orderCandidatesListPage: payload });
          return payload;
        })
      );
  }

  @Action(ClearOrderCandidatePage)
  ClearOrderCandidatePage({ patchState }: StateContext<OrderManagementContentStateModel>): void {
    patchState({ orderCandidatesListPage: null });
  }

  @Action(GetSelectedOrderById)
  GetSelectedOrderById(
    { patchState, dispatch }: StateContext<OrderManagementContentStateModel>,
    { payload }: GetSelectedOrderById
  ): Observable<Order> {
    return this.orderManagementService.getOrderById(payload).pipe(
      tap((payload) => {
        patchState({ selectedOrder: payload });
        const { orderType, departmentId, skillId, jobStartDate, jobEndDate } = payload;
        dispatch(
          new SetPredefinedBillRatesData(
            orderType,
            departmentId,
            skillId,
            jobStartDate ? DateTimeHelper.toUtcFormat(jobStartDate) : jobStartDate,
            jobEndDate ? DateTimeHelper.toUtcFormat(jobEndDate) : jobEndDate
          )
        );

        return payload;
      })
    );
  }

  @Action(ClearSelectedOrder)
  ClearSelectedOrder({ patchState }: StateContext<OrderManagementContentStateModel>): void {
    patchState({ selectedOrder: null });
  }

  @Action(GetOrganizationStatesWithKeyCode)
  GetOrganizationStatesWithKeyCode({
    patchState,
  }: StateContext<OrderManagementContentStateModel>): Observable<OrganizationStateWithKeyCode[]> {
    return this.orderManagementService.getOrganizationStatesWitKeyCode().pipe(
      tap((payload) => {
        patchState({ organizationStatesWithKeyCode: payload });
        return payload;
      })
    );
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
  UpdateOrganisationCandidateJob(
    { dispatch }: StateContext<OrderManagementModel>,
    { payload }: UpdateOrganisationCandidateJob
  ): Observable<any> {
    return this.orderManagementService.updateCandidateJob(payload).pipe(
      tap((message: { weekStartDate: string }[]) => {
        if (message?.length) {
          const dates = message.map(({ weekStartDate }) => DateTimeHelper.formatDateUTC(weekStartDate, 'MM/dd/YYYY'));

          dispatch(new ShowToast(MessageTypes.Success, updateCandidateJobMessage(dates)));
        } else {
          dispatch(new ShowToast(MessageTypes.Success, 'Candidate was updated'));
        }
        dispatch(new UpdateOrganisationCandidateJobSucceed());
      }),
      catchError((error: any) => {
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)));
      })
    );
  }

  @Action(GetWorkflows)
  GetWorkflows(
    { patchState }: StateContext<OrderManagementContentStateModel>,
    { departmentId, skillId }: GetWorkflows
  ): Observable<WorkflowByDepartmentAndSkill[]> {
    return this.orderManagementService.getWorkflowsByDepartmentAndSkill(departmentId, skillId).pipe(
      tap((payload) => {
        patchState({ workflows: payload });
        return payload;
      })
    );
  }

  @Action(GetProjectTypes)
  GetProjectTypes({ patchState }: StateContext<OrderManagementContentStateModel>): Observable<ProjectType[]> {
    return this.projectsService.getProjectTypes().pipe(
      tap((payload) => {
        patchState({ projectTypes: payload });
      })
    );
  }

  @Action(GetProjectSpecialData)
  GetProjectSpecialData(
    { patchState }: StateContext<OrderManagementContentStateModel>,
    { lastSelectedBusinessUnitId }: GetProjectSpecialData
  ): Observable<ProjectSpecialData> {
    return this.projectsService.getProjectSpecialData(lastSelectedBusinessUnitId).pipe(
      tap((payload) => {
        patchState({ projectSpecialData: payload });
      })
    );
  }

  @Action(GetSuggestedDetails)
  GetSuggestedDetails(
    { patchState }: StateContext<OrderManagementContentStateModel>,
    { locationId }: GetSuggestedDetails
  ): Observable<SuggestedDetails> {
    return this.orderManagementService.getSuggestedDetails(locationId).pipe(
      tap((payload) => {
        patchState({ suggestedDetails: payload });
      })
    );
  }

  @Action(ClearSuggestions)
  ClearSuggestions(
    { patchState }: StateContext<OrderManagementContentStateModel>,
    {}: ClearSuggestions
  ): OrderManagementContentStateModel {
    return patchState({ suggestedDetails: null });
  }

  @Action(GetProjectNames)
  GetProjectNames({ patchState }: StateContext<OrderManagementContentStateModel>): Observable<ProjectName[]> {
    return this.projectsService.getProjectNames().pipe(
      tap((payload) => {
        patchState({ projectNames: payload });
      })
    );
  }

  @Action(GetAssociateAgencies)
  GetAssociateAgencies(
    { patchState }: StateContext<OrderManagementContentStateModel>,
    { lastSelectedBusinessUnitId }: GetAssociateAgencies
  ): Observable<AssociateAgency[]> {
    return this.orderManagementService.getAssociateAgencies(lastSelectedBusinessUnitId).pipe(
      tap((payload) => {
        patchState({ associateAgencies: payload });
      })
    );
  }

  @Action(SetPredefinedBillRatesData)
  SetPredefinedBillRatesData(
    { patchState }: StateContext<OrderManagementContentStateModel>,
    { orderType, departmentId, skillId, jobStartDate, jobEndDate }: SetPredefinedBillRatesData
  ): Observable<null> {
    patchState({ getPredefinedBillRatesData: null });

    return of(null).pipe(
      debounceTime(100),
      tap(() =>
        patchState({ getPredefinedBillRatesData: { orderType, departmentId, skillId, jobStartDate, jobEndDate } })
      )
    );
  }

  @Action(GetPredefinedBillRates)
  GetPredefinedBillRates({
    patchState,
    getState,
  }: StateContext<OrderManagementContentStateModel>): Observable<BillRate[]> {
    const state = getState();
    const getPredefinedBillRatesData = state.getPredefinedBillRatesData;

    if (getPredefinedBillRatesData) {
      const { orderType, departmentId, skillId, jobStartDate, jobEndDate } = getPredefinedBillRatesData;

      if (!isNaN(orderType) && !isNaN(departmentId) && !isNaN(skillId)) {
        return this.orderManagementService
          .getPredefinedBillRates(orderType, departmentId, skillId, jobStartDate, jobEndDate)
          .pipe(
            tap((payload) => {
              patchState({ predefinedBillRates: payload });
              return payload;
            })
          );
      }
    }

    patchState({ predefinedBillRates: [] });
    return of([]);
  }

  @Action(ClearPredefinedBillRates)
  ClearPredefinedBillRates({ patchState }: StateContext<OrderManagementContentStateModel>): void {
    patchState({
      getPredefinedBillRatesData: null,
      predefinedBillRates: [],
    });
  }

  @Action(SetIsDirtyOrderForm)
  SetIsDirtyOrderForm(
    { patchState }: StateContext<OrderManagementContentStateModel>,
    { isDirtyOrderForm }: SetIsDirtyOrderForm
  ): void {
    patchState({ isDirtyOrderForm });
  }

  @Action(SaveOrder)
  SaveOrder(
    { dispatch }: StateContext<OrderManagementContentStateModel>,
    { order, documents, comments, lastSelectedBusinessUnitId }: SaveOrder
  ): Observable<Order | void> {
    return this.orderManagementService.saveOrder(order, documents, comments, lastSelectedBusinessUnitId).pipe(
      tap((payload) => {
        let TOAST_MESSAGE = 'Record has been created';
        let MESSAGE_TYPE = MessageTypes.Success;
        const hasntOrderCredentials = order?.isQuickOrder && payload.credentials.length === 0;
        const hasntOrderBillRates =
          ((order?.isQuickOrder && payload.orderType === OrderType.Traveler) ||
            payload.orderType === OrderType.ContractToPerm) &&
          payload.billRates.length === 0;

        if (hasntOrderCredentials && hasntOrderBillRates) {
          TOAST_MESSAGE += `. ${ORDER_WITHOUT_CRED_BILLRATES}`;
          MESSAGE_TYPE = MessageTypes.Warning;
        } else if (hasntOrderCredentials) {
          TOAST_MESSAGE += `. ${ORDER_WITHOUT_CREDENTIALS}`;
          MESSAGE_TYPE = MessageTypes.Warning;
        } else if (hasntOrderBillRates) {
          TOAST_MESSAGE += `. ${ORDER_WITHOUT_BILLRATES}`;
          MESSAGE_TYPE = MessageTypes.Warning;
        }
        dispatch([
          order?.isQuickOrder
            ? new ShowToast(
                MESSAGE_TYPE,
                TOAST_MESSAGE,
                order.isQuickOrder,
                payload.organizationPrefix,
                payload.publicId
              )
            : new ShowToast(MessageTypes.Success, RECORD_ADDED),
          new SaveOrderSucceeded(payload),
          new SetIsDirtyOrderForm(false),
          new SaveLastSelectedOrganizationAgencyId(
            {
              lastSelectedOrganizationId: Number(payload.organizationId),
              lastSelectedAgencyId: null,
            },
            true
          ),
        ]);

        return payload;
      }),
      catchError((error) => dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error))))
    );
  }

  @Action(EditOrder)
  EditOrder(
    { dispatch }: StateContext<OrderManagementContentStateModel>,
    { order, documents }: EditOrder
  ): Observable<Order | void> {
    return this.orderManagementService.editOrder(order, documents).pipe(
      tap((order) => {
        dispatch([
          new ShowToast(MessageTypes.Success, RECORD_MODIFIED),
          new SaveOrderSucceeded(order),
          new SetIsDirtyOrderForm(false),
        ]);

        return order;
      }),
      catchError((error) => dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error))))
    );
  }

  @Action(DeleteOrder)
  DeleteOrder({ dispatch }: StateContext<OrderManagementContentStateModel>, { id }: DeleteOrder): Observable<any> {
    return this.orderManagementService.deleteOrder(id).pipe(
      tap(() => {
        dispatch(new DeleteOrderSucceeded());
      }),
      catchError((error: any) => of(dispatch(new ShowToast(MessageTypes.Error, 'Order cannot be deleted'))))
    );
  }

  @Action(GetRejectReasonsForOrganisation)
  GetRejectReasonsForOrganisation({
    patchState,
  }: StateContext<OrderManagementContentStateModel>): Observable<RejectReasonPage> {
    return this.rejectReasonService.getAllRejectReasons().pipe(
      tap((reasons) => {
        patchState({ rejectionReasonsList: reasons.items });
        return reasons;
      })
    );
  }

  @Action(RejectCandidateJob)
  RejectCandidateJob(
    { dispatch }: StateContext<OrderManagementContentStateModel>,
    { payload }: RejectCandidateJob
  ): Observable<void> {
    return this.orderManagementService.rejectCandidateJob(payload).pipe(
      tap(() => {
        dispatch([new ShowToast(MessageTypes.Success, RECORD_MODIFIED), new RejectCandidateForOrganisationSuccess()]);
      })
    );
  }

  @Action(CancelOrganizationCandidateJob)
  CancelOrganizationCandidateJob(
    { dispatch }: StateContext<OrderManagementContentStateModel>,
    { payload }: CancelOrganizationCandidateJob
  ): Observable<void> {
    return this.orderManagementService.cancelCandidateJob(payload).pipe(
      tap(() => {
        dispatch([new ShowToast(MessageTypes.Success, RECORD_MODIFIED), new CancelOrganizationCandidateJobSuccess()]);
      })
    );
  }

  @Action(ApproveOrder)
  ApproveOrder(
    { dispatch }: StateContext<OrderManagementContentStateModel>,
    { id }: ApproveOrder
  ): Observable<string | void> {
    return this.orderManagementService
      .approveOrder(id)
      .pipe(catchError((error) => dispatch(new ShowToast(MessageTypes.Error, error.error))));
  }

  @Action(GetOrderFilterDataSources)
  GetOrderFilterDataSources({
    patchState,
  }: StateContext<OrderManagementContentStateModel>): Observable<OrderFilterDataSource> {
    return this.orderManagementService.getOrderFilterDataSources().pipe(
      tap((payload) => {
        patchState({ orderFilterDataSources: payload });
        return payload;
      })
    );
  }

  @Action(GetHistoricalData)
  GetHistoricalData(
    { patchState, dispatch }: StateContext<OrderManagementContentStateModel>,
    { organizationId, candidateJobId }: GetHistoricalData
  ): Observable<HistoricalEvent[]> {
    return this.orderManagementService.getHistoricalData(organizationId, candidateJobId).pipe(
      tap((payload: HistoricalEvent[]) => {
        patchState({ historicalEvents: payload });
        return payload;
      }),
      catchError(() => {
        dispatch(new ClearHistoricalData());
        return of();
      })
    );
  }

  @Action(ClearHistoricalData)
  ClearHistoricalData({ patchState }: StateContext<OrderManagementContentStateModel>): void {
    patchState({ historicalEvents: [] });
  }

  @Action(GetCandidatesBasicInfo)
  GetCandidatesBasicInfo(
    { patchState }: StateContext<OrderManagementContentStateModel>,
    { organizationId, jobId }: GetCandidatesBasicInfo
  ): Observable<CandidatesBasicInfo> {
    return this.orderManagementService.getCandidatesBasicInfo(organizationId, jobId).pipe(
      tap((payload) => {
        patchState({ candidatesBasicInfo: payload });
        return payload;
      }),
      catchError(() => {
        patchState({ candidatesBasicInfo: null });
        return of();
      })
    );
  }

  @Action(ExportOrders)
  ExportOrders({}: StateContext<OrderManagementContentStateModel>, { payload, tab }: ExportOrders): Observable<any> {
    return this.orderManagementService.export(payload, tab).pipe(
      tap((file) => {
        const url = window.URL.createObjectURL(file);
        saveSpreadSheetDocument(url, payload.filename || 'export', payload.exportFileType);
      })
    );
  }

  @Action(DuplicateOrder)
  DuplicateOrder(
    { dispatch }: StateContext<OrderManagementContentStateModel>,
    { payload }: DuplicateOrder
  ): Observable<number> {
    return this.orderManagementService.duplicate(payload).pipe(
      tap((id: number) => {
        dispatch(new DuplicateOrderSuccess(id));
      })
    );
  }

  @Action(SelectNavigationTab)
  SelectNavigationTab(
    { patchState }: StateContext<OrderManagementContentStateModel>,
    { active, pending, current }: SelectNavigationTab
  ): void {
    patchState({ navigationTab: { active, pending, current } });
  }

  @Action(GetContactDetails)
  GetContactDetails(
    { patchState }: StateContext<OrderManagementContentStateModel>,
    { departmentId, lastSelectedBusinessId }: GetContactDetails
  ): Observable<Department> {
    return this.departmentService.getDepartmentData(departmentId, lastSelectedBusinessId).pipe(
      tap((contactDetails: Department) => {
        patchState({ contactDetails });
      })
    );
  }

  @Action(GetOrganizationExtensions)
  GetOrganizationExtensions(
    { patchState }: StateContext<OrderManagementContentStateModel>,
    { id, orderId }: GetOrganizationExtensions
  ): Observable<ExtensionGridModel[]> {
    return this.extensionSidebarService
      .getExtensions(id, orderId)
      .pipe(tap((extensions) => patchState({ extensions })));
  }

  @Action(SetIsDirtyQuickOrderForm)
  SetIsDirtyQuickOrderForm(
    { patchState }: StateContext<OrderManagementContentStateModel>,
    { isDirtyQuickOrderForm }: SetIsDirtyQuickOrderForm
  ): void {
    patchState({ isDirtyQuickOrderForm });
  }
}
