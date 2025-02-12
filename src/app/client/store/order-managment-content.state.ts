import { SaveLastSelectedOrganizationAgencyId } from '../../store/user.actions';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { getAllErrors } from '@shared/utils/error.utils';
import { catchError, Observable, of, switchMap, tap } from 'rxjs';
import {
  ApproveOrder,
  CancelOrganizationCandidateJob,
  CancelOrganizationCandidateJobSuccess,
  ClearHistoricalData,
  ClearOrderCandidatePage,
  ClearOrders,
  ClearOrganisationCandidateJob,
  ClearPredefinedBillRates,
  ClearSelectedOrder,
  ClearSuggestions,
  DeleteOrder,
  DeleteOrderSucceeded,
  DuplicateOrder,
  DuplicateOrderSuccess, EditIrpOrder,
  EditOrder,
  ExportOrders,
  GetAgencyOrderCandidatesList,
  GetAssociateAgencies,
  GetAvailableSteps,
  GetContactDetails,
  GetHistoricalData, GetIrpOrderCandidates, GetIRPOrders,
  GetOrderById,
  GetOrderByIdSucceeded,
  GetOrderFilterDataSources,
  GetOrderImportErrors,
  GetOrderImportErrorsSucceeded,
  GetOrderImportTemplate,
  GetOrderImportTemplateSucceeded,
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
  RejectCandidateJob, SaveIrpOrder, SaveIrpOrderSucceeded,
  SaveOrder,
  SaveOrderImportResult,
  SaveOrderImportResultSucceeded,
  SaveOrderSucceeded,
  SelectNavigationTab,
  SetIsDirtyOrderForm,
  SetIsDirtyQuickOrderForm,
  SetLock,
  SetPredefinedBillRatesData,
  UpdateOrganisationCandidateJob,
  UpdateOrganisationCandidateJobSucceed,
  UploadOrderImportFile,
  UploadOrderImportFileSucceeded,
  UpdateRegRateorder,
  GetCandidateCancellationReason,
  ExportIRPOrders,
  ClearOrderFilterDataSources,
  GetOrdersJourney,
  ExportOrdersJourney,
  GetAllShifts,
  sendOnboardCandidateEmailMessage,
  GetOrderComments,
  ApproveOrderSucceeded,
  ClearCandidateCancellationReason,
  GetOrderAuditHistory,
  GetOrderCredentialAuditHistory,
  GetOrderBillRatesAuditHistory,
  GetOrderContactAuditHistory,
  GetOrderJobDistributionAuditHistory,
  GetOrderWorkLocationAuditHistory,
  GetOrderClassificationAuditHistory,
  GetOrderHistoryDetailSucceeded,
  GetOrderClassificationDetailSucceeded,
  GetOrderJobDistributionDetailSucceeded,
  GetOrderWorkLocationDetailSucceeded,
  GetOrderCredentialDetailSucceeded,
  GetOrderContactDetailSucceeded,
  GetOrderBillRateDetailSucceeded,
  GetParentOrderById,
  GetIrpOrderExtensionCandidates,
  GetJobDistributionValues,
  cancelCandidateJobforIRP,
  SaveClearToStart,
  SaveClearToStartSucceeded
} from '@client/store/order-managment-content.actions';
import { OrderManagementContentService } from '@shared/services/order-management-content.service';
import {
  ApplicantStatus,
  CandidateCancellationReason,
  GetPredefinedBillRatesData,
  IrpCandidatesParams,
  IrpOrderCandidate,
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
  OrderManagementPage,
  OrderWorkLocationAuditHistory,
  OrdersJourneyPage,
  OrgStructureDto,
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
  UpdateRegularRatesucceedcount,
  TravelerContracttoPermOrdersSucceedMessage,
  RECORD_DELETE,
  RECORD_MODIFIED_SUCCESS_WITH_ORDERID,
  RECORD_SAVED_SUCCESS_WITH_ORDERID,
  UpdateRegularRateReordersucceedcount,
  UpdateRegularRateReorderOpensucceedcount,
  UpdateReorderFilled,
  PerDiemErrorMessage,
  ReOrdersErrorMessage,
} from '@shared/constants';
import { getGroupedCredentials } from '@shared/components/order-details/order.utils';
import { BillRate, BillRateOption } from '@shared/models/bill-rate.model';
import { OrderManagementModel } from '@agency/store/order-management.state';
import { ProjectSpecialData } from '@shared/models/project-special-data.model';
import { RejectReasonService } from '@shared/services/reject-reason.service';
import { RejectReason, RejectReasonPage } from '@shared/models/reject-reason.model';
import { HistoricalEvent } from '@shared/models/historical-event.model';
import { saveSpreadSheetDocument } from '@shared/utils/file.utils';
import { NavigationTabModel } from '@shared/models/navigation-tab.model';
import { DepartmentsService } from '@shared/services/departments.service';
import { Department } from '@shared/models/department.model';
import { ExtensionSidebarService } from '@shared/components/extension/extension-sidebar/extension-sidebar.service';
import { ExtensionGridModel } from '@shared/components/extension/extension-sidebar/models/extension.model';
import { OrderType } from '@shared/enums/order-type';
import { createUniqHashObj } from '@core/helpers/functions.helper';
import { DateTimeHelper } from '@core/helpers';
import { ApplicantStatus as ApplicantStatusEnum } from '@shared/enums/applicant-status.enum';
import { sortByField } from '@shared/helpers/sort-by-field.helper';
import { OrderImportService } from '@client/order-management/components/order-import/order-import.service';
import { OrderImportResult } from '@shared/models/imported-order.model';
import { OrderManagementIrpApiService } from '@shared/services/order-management-irp-api.service';
import { createFormData } from '@client/order-management/helpers';
import { PageOfCollections } from '@shared/models/page.model';
import { UpdateRegRateService } from '@client/order-management/components/update-reg-rate/update-reg-rate.service';
import { UpdateRegrateModel } from '@shared/models/update-regrate.model';
import { ScheduleShift } from '@shared/models/schedule-shift.model';
import { HttpErrorResponse } from '@angular/common/http';
import { CommentsService } from '@shared/services/comments.service';
import { Comment } from '@shared/models/comment.model';
import { ChangeInternalDistributionSuccess } from '@client/order-management/components/irp-tabs/order-details/constants';

export interface OrderManagementContentStateModel {
  ordersPage: OrderManagementPage | null;
  ordersJourneyPage: OrdersJourneyPage | null;
  selectedOrder: Order | null;
  OrgStructure: OrgStructureDto |null;
  selectedParentOrder: Order | null;
  candidatesJob: OrderCandidateJob | null;
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
  irpCandidates: PageOfCollections<IrpOrderCandidate> | null;
  candidateCancellationReasons: CandidateCancellationReason[] | null;
  allShifts: ScheduleShift[] | null;
  sendOnboardCandidateEmail: OnboardCandidateEmail | null;
  orderComments: Comment[];
  OrderAuditHistory: OrderAuditHistory[];
  OrderCredentialAuditHistory: OrderCredentialAuditHistory[];
  OrderBillRatesAuditHistory: OrderBillRateAuditHistory[];
  OrderContactAuditHistory: OrderContactAuditHistory[];
  OrderWorkLocationAuditHistory: OrderWorkLocationAuditHistory[];
  OrderJobDistributionAuditHistory: OrderJobDistributionAuditHistory[],
  OrderClassificationAuditHistory: OrderClassificationAuditHistory[];
  irpCandidatesforExtension: OrderCandidatesListPage | null,
}

@State<OrderManagementContentStateModel>({
  name: 'orderManagement',
  defaults: {
    ordersPage: null,
    ordersJourneyPage: null,
    selectedOrder: null,
    OrgStructure:null,
    selectedParentOrder: null,
    orderCandidatesListPage: null,
    candidatesJob: null,
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
    irpCandidates: null,
    candidateCancellationReasons: null,
    allShifts: null,
    sendOnboardCandidateEmail: null,
    orderComments: [],
    OrderAuditHistory: [],
    OrderCredentialAuditHistory: [],
    OrderBillRatesAuditHistory: [],
    OrderContactAuditHistory: [],
    OrderWorkLocationAuditHistory: [],
    OrderJobDistributionAuditHistory: [],
    OrderClassificationAuditHistory: [],
    irpCandidatesforExtension: null
  },
})
@Injectable()
export class OrderManagementContentState {
  @Selector()
  static ordersPage(state: OrderManagementContentStateModel): OrderManagementPage | null {
    return state.ordersPage;
  }

  @Selector()
  static ordersJourneyPage(state: OrderManagementContentStateModel): OrdersJourneyPage | null {
    return state.ordersJourneyPage;
  }

  @Selector()
  static selectedOrder(state: OrderManagementContentStateModel): Order | null {
    return state.selectedOrder;
  }

  @Selector()
  static selectedParentOrder(state: OrderManagementContentStateModel): Order | null {
    return state.selectedParentOrder;
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
  static irpCandidatesforExtension(state: OrderManagementContentStateModel): OrderCandidatesListPage | null {
    return state.irpCandidatesforExtension;
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

    const billRateOptions = Object.values(uniqBillRatesHashObj).map((el: BillRateOption) => el);
    return sortByField(billRateOptions, 'title');
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

  @Selector()
  static orderCandidatesLength(state: OrderManagementContentStateModel): number {
    return (
      state.orderCandidatesListPage?.items.filter(
        (candidate) =>
          candidate.status !== ApplicantStatusEnum.Rejected &&
          candidate.status !== ApplicantStatusEnum.NotApplied &&
          candidate.status !== ApplicantStatusEnum.Withdraw
      ).length || 0
    );
  }

  @Selector()
  static getIrpCandidates(state: OrderManagementContentStateModel): PageOfCollections<IrpOrderCandidate> | null {
    return state.irpCandidates;
  }

  @Selector()
  static getIrpCandidatesCount(state: OrderManagementContentStateModel): number {
    return state.irpCandidates?.items.length || 0;
  }

  @Selector()
  static getCandidateCancellationReasons(
    state: OrderManagementContentStateModel
  ): CandidateCancellationReason[] | null {
    return state.candidateCancellationReasons || null;
  }

  @Selector()
  static getAllShifts(state: OrderManagementContentStateModel): ScheduleShift[] | null {
    return state.allShifts || null;
  }

  @Selector()
  static orderComments(state: OrderManagementContentStateModel): Comment[] {
    return state.orderComments;
  }

  @Selector()
  static getOrderAuditHistoryDetails(state: OrderManagementContentStateModel): OrderAuditHistory[] {
    return state.OrderAuditHistory;
  }
  @Selector()
  static selectedDistribution(state: OrderManagementContentStateModel): OrgStructureDto | null {
    return state.OrgStructure;
  }

  @Selector()
  static getOrderCredentialAuditHistory(state: OrderManagementContentStateModel): OrderCredentialAuditHistory[] {
    return state.OrderCredentialAuditHistory;
  }


  @Selector()
  static getOrderBillRatesAuditHistory(state: OrderManagementContentStateModel): OrderBillRateAuditHistory[] {
    return state.OrderBillRatesAuditHistory;
  }

  @Selector()
  static getOrderContactAuditHistory(state: OrderManagementContentStateModel): OrderContactAuditHistory[] {
    return state.OrderContactAuditHistory;
  }

  @Selector()
  static getOrderWorkLocationAuditHistory(state: OrderManagementContentStateModel): OrderWorkLocationAuditHistory[] {
    return state.OrderWorkLocationAuditHistory;
  }

  @Selector()
  static getOrderJobDistributionAuditHistory(state: OrderManagementContentStateModel): OrderJobDistributionAuditHistory[] {
    return state.OrderJobDistributionAuditHistory;
  }

  @Selector()
  static getOrderClassificationAuditHistory(state: OrderManagementContentStateModel): OrderClassificationAuditHistory[] {
    return state.OrderClassificationAuditHistory;
  }

  constructor(
    private orderManagementService: OrderManagementContentService,
    private orderManagementIrpApiService: OrderManagementIrpApiService,
    private projectsService: ProjectsService,
    private departmentService: DepartmentsService,
    private rejectReasonService: RejectReasonService,
    private extensionSidebarService: ExtensionSidebarService,
    private orderImportService: OrderImportService,
    private UpdateRegRateService: UpdateRegRateService,
    private commentService: CommentsService
  ) { }

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

  @Action(GetIRPOrders, { cancelUncompleted: true })
  GetIRPOrders({ patchState }: StateContext<OrderManagementContentStateModel>, { payload }: GetIRPOrders) {
    patchState({ ordersPage: null });

    return this.orderManagementIrpApiService.getOrders(payload).pipe(
      tap((orders) => {
        patchState({ ordersPage: orders as unknown as OrderManagementPage });
      })
    );
  }

  @Action(GetOrdersJourney, { cancelUncompleted: true })
  GetOrdersJourney({ patchState }: StateContext<OrderManagementContentStateModel>, { payload }: GetOrdersJourney) {
    patchState({ ordersJourneyPage: null });

    return this.orderManagementService.getOrdersJourney(payload).pipe(
      tap((orders) => {
        patchState({ ordersJourneyPage: orders as unknown as OrdersJourneyPage });
      })
    );
  }

  @Action(ClearOrders)
  ClearOrders({ patchState }: StateContext<OrderManagementContentStateModel>): OrderManagementContentStateModel {
    return patchState({ ordersPage: null });
  }

  @Action(GetOrderById, { cancelUncompleted: true })
  GetOrderById(
    { patchState, dispatch }: StateContext<OrderManagementContentStateModel>,
    { id, options, isIrp, system }: GetOrderById
  ): Observable<Order> {
    patchState({ orderDialogOptions: options });
    return this.orderManagementService.getOrderById(id, isIrp, system).pipe(
      tap((payload) => {
        const groupedCredentials = getGroupedCredentials(payload.credentials ?? payload.reOrderFrom?.credentials);
        payload.groupedCredentials = groupedCredentials;
        patchState({ selectedOrder: payload });
        const { orderType, departmentId, jobStartDate, jobEndDate } = payload;
        let skillId = payload.skillId;

        if (payload.irpOrderMetadata) {
          skillId = payload.irpOrderMetadata.skillId;
        } else if (payload.reOrderFromId && payload.reOrderFrom) {
          skillId = payload.reOrderFrom.skillId;
        }

        dispatch(
          new SetPredefinedBillRatesData(
            orderType,
            departmentId,
            skillId,
            jobStartDate ? DateTimeHelper.setUtcTimeZone(jobStartDate) : jobStartDate,
            jobEndDate ? DateTimeHelper.setUtcTimeZone(jobEndDate) : jobEndDate
          )
        );

        dispatch(new GetOrderByIdSucceeded());
        return payload;
      })
    );
  }

  @Action(GetJobDistributionValues)
  GetJobDistributionValue({ patchState, dispatch }: StateContext<OrderManagementContentStateModel>, { payload }:
    GetJobDistributionValues): Observable<OrgStructureDto | void> {
    return this.orderManagementService.getJobDistributionValues(payload).pipe(
      tap((payloads) => {
        patchState({ OrgStructure: payloads });
        dispatch(new GetOrderJobDistributionDetailSucceeded());
        return payloads;
      }),
      catchError((error: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)));
      }));
  }

  @Action(SetLock)
  SetLock(
    { dispatch }: StateContext<OrderManagementContentStateModel>,
    { id, lockStatus, lockStatusIRP, filters, prefixId, isIrp, updateOpened }: SetLock
  ): Observable<boolean | void> {
    return this.orderManagementService.setLock(id, lockStatus, lockStatusIRP).pipe(
      tap(() => {
        const message = isIrp
          ? lockStatusIRP
            ? `The Order ${prefixId} is locked`
            : `The Order ${prefixId} is unlocked`
          : lockStatus
            ? `The Order ${prefixId} is locked`
            : `The Order ${prefixId} is unlocked`;
        const actions = [
          new LockUpdatedSuccessfully(),
          new ShowToast(MessageTypes.Success, message),
          isIrp ? new GetIRPOrders(filters) : new GetOrders(filters),
        ];
        dispatch(updateOpened ? [...actions, new GetSelectedOrderById(id)] : actions);
      }),
      catchError((error: any) => {
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)));
      })
    );
  }

  @Action(GetAgencyOrderCandidatesList, { cancelUncompleted: true })
  GetAgencyOrderCandidatesPage(
    { patchState }: StateContext<OrderManagementContentStateModel>,
    { orderId, organizationId, pageNumber, pageSize, excludeDeployed, searchTerm }: GetAgencyOrderCandidatesList
  ): Observable<OrderCandidatesListPage> {
    return this.orderManagementService
      .getOrderCandidatesList(orderId, organizationId, pageNumber, pageSize, excludeDeployed, searchTerm)
      .pipe(
        tap((payload) => {
          patchState({ orderCandidatesListPage: payload });
          return payload;
        })
      );
  }

  @Action(GetIrpOrderCandidates)
  GetIrpOrderCandidates(
    { patchState }: StateContext<OrderManagementContentStateModel>,
    { orderId, pageNumber, pageSize, isAvailable, includeDeployed, searchTerm }: GetIrpOrderCandidates
  ): Observable<PageOfCollections<IrpOrderCandidate>> {
    const params: IrpCandidatesParams = {
      PageSize: pageSize,
      PageNumber: pageNumber,
      includeDeployed,
      isAvailable,
      searchTerm,
    };

    return this.orderManagementService.getIrpCandidates(orderId, params).pipe(
      tap((response) => {
        patchState({
          irpCandidates: response,
        });
      })
    );
  }


  @Action(GetIrpOrderExtensionCandidates)
  GetIrpOrderExtensionCandidates(
    { patchState }: StateContext<OrderManagementContentStateModel>,
    { orderId, pageNumber, pageSize, isAvailable, includeDeployed, searchTerm }: GetIrpOrderExtensionCandidates
  ): Observable<OrderCandidatesListPage> {
    const params: IrpCandidatesParams = {
      PageSize: pageSize,
      PageNumber: pageNumber,
      includeDeployed,
      isAvailable,
      searchTerm,
    };

    return this.orderManagementService.getIrpExtensionCandidates(orderId, params)
    .pipe(
      tap((payload) => {
        patchState({irpCandidatesforExtension: payload});
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
    { payload, isIRP }: GetSelectedOrderById
  ): Observable<Order> {
    return this.orderManagementService.getOrderById(payload, isIRP).pipe(
      tap((payload) => {
        patchState({ selectedOrder: payload });
        const { orderType, departmentId, jobStartDate, jobEndDate, isTemplate } = payload;
        const skill = payload.irpOrderMetadata ? payload.irpOrderMetadata.skillId : payload.skillId;

        if (!isTemplate && orderType && departmentId && jobStartDate && jobEndDate) {
          dispatch(
            new SetPredefinedBillRatesData(
              orderType,
              departmentId,
              skill,
              jobStartDate ? DateTimeHelper.setUtcTimeZone(jobStartDate) : jobStartDate,
              jobEndDate ? DateTimeHelper.setUtcTimeZone(jobEndDate) : jobEndDate,
              true
            )
          );
        }

        return payload;
      })
    );
  }

  @Action(GetParentOrderById)
  GetParentOrderById(
    { patchState, dispatch }: StateContext<OrderManagementContentStateModel>,
    { payload }: GetParentOrderById
  ): Observable<Order> {
    return this.orderManagementService.getOrderById(payload, false).pipe(
      tap((payload) => {
        patchState({ selectedParentOrder: payload });
        return payload;
      })
    );
  }

  @Action(ClearSelectedOrder)
  ClearSelectedOrder({ patchState }: StateContext<OrderManagementContentStateModel>): void {
    patchState({ selectedOrder: null, contactDetails: null });
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

  @Action(ClearOrganisationCandidateJob)
  ClearOrganisationCandidateJob({ patchState }: StateContext<OrderManagementContentStateModel>): void {
    patchState({ candidatesJob: null });
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
    { }: ClearSuggestions
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
        patchState({ associateAgencies: sortByField(payload, 'agencyName') });
      })
    );
  }

  @Action(SetPredefinedBillRatesData)
  SetPredefinedBillRatesData(
    { patchState }: StateContext<OrderManagementContentStateModel>,
    { orderType, departmentId, skillId, jobStartDate, jobEndDate, ignoreUpdateBillRate }: SetPredefinedBillRatesData
  ): OrderManagementContentStateModel {
    return patchState({
      getPredefinedBillRatesData: {
        orderType,
        departmentId,
        skillId,
        jobStartDate,
        jobEndDate,
        ignoreUpdateBillRate,
      },
    });
  }

  @Action(GetPredefinedBillRates)
  GetPredefinedBillRates({
    patchState,
    getState,
  }: StateContext<OrderManagementContentStateModel>): Observable<BillRate[]> {
    const state = getState();
    const getPredefinedBillRatesData = state.getPredefinedBillRatesData;

    if (getPredefinedBillRatesData && !getPredefinedBillRatesData.ignoreUpdateBillRate) {
      const { orderType, departmentId, skillId, jobStartDate, jobEndDate } = getPredefinedBillRatesData;

      if (!isNaN(orderType) && !isNaN(departmentId) && !isNaN(skillId)) {
        return this.orderManagementService
          .getPredefinedBillRates(orderType, departmentId, skillId, jobStartDate, jobEndDate)
          .pipe(
            tap((payload) => {
              patchState({ predefinedBillRates: payload });
            })
          );
      }
    }

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

  @Action(SaveIrpOrder)
  SaveIrpOrder(
    { dispatch }: StateContext<OrderManagementContentStateModel>,
    { order, documents, inActivedatestr,expiryMessage,isTemplate }: SaveIrpOrder
  ): Observable<void | Blob[] | Order> {
    return this.orderManagementService.saveIrpOrder(order).pipe(
      switchMap((order: Order[]) => {
        dispatch([
          new ShowToast(
            MessageTypes.Success,
            !isTemplate
              ? order.length == 1 && !(inActivedatestr?.toString() != '' && inActivedatestr?.toString() != undefined)
                ? 'Order ' +
                order[0].organizationPrefix?.toString() +
                '-' +
                order[0].publicId?.toString() +
                ' has been added'
                : inActivedatestr?.toString() != '' && inActivedatestr?.toString() != undefined
                ? RECORD_ADDED +
                ` Due to ${expiryMessage} Expiry `+
                    inActivedatestr +
                    ' Dates orders not added.'
                  : RECORD_ADDED
              : 'Template ' +
              order[0].organizationPrefix?.toString() +
              '-' +
              order[0].publicId?.toString() +
              ' has been added'
          ),
        
          new SaveIrpOrderSucceeded(),
        ]);
        if (documents.length) {
          return this.orderManagementService.saveDocumentsForIrpOrder(createFormData(order, documents));
        } else {
          return order;
        }
      }),
      catchError((error) => dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error))))
    );
  }

  @Action(SaveOrder)
  SaveOrder(
    { dispatch }: StateContext<OrderManagementContentStateModel>,
    { order, documents, comments, lastSelectedBusinessUnitId }: SaveOrder
  ): Observable<Order | void> {
    return this.orderManagementService.saveOrder(order, documents, comments, lastSelectedBusinessUnitId).pipe(
      tap((payload) => {
        let TOAST_MESSAGE = RECORD_ADDED;
        let MESSAGE_TYPE = MessageTypes.Success;
        const hasntOrderCredentials = order?.isQuickOrder && payload.credentials.length === 0;
        const hasntOrderBillRates =
          ((order?.isQuickOrder && payload.orderType === OrderType.LongTermAssignment) ||
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
            : new ShowToast(
              MessageTypes.Success,
              RECORD_SAVED_SUCCESS_WITH_ORDERID(
                payload?.organizationPrefix ?? '',
                payload?.publicId?.toString() ?? ''
              )
            ),
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

  @Action(EditIrpOrder)
  EditIrpOrder(
    { dispatch }: StateContext<OrderManagementContentStateModel>,
    { order, documents, internalDistributionChanged }: EditIrpOrder
  ): Observable<void | Blob[] | Order> {
    return this.orderManagementService.editIrpOrder(order).pipe(
      switchMap((order: Order) => {
        const successMessage = internalDistributionChanged
          ? ChangeInternalDistributionSuccess
          : RECORD_MODIFIED_SUCCESS_WITH_ORDERID(
            order?.organizationPrefix ?? '',
            order?.publicId?.toString() ?? ''
          );

        dispatch([new ShowToast(MessageTypes.Success, successMessage), new SaveIrpOrderSucceeded()]);
          if (documents.length) {
            let orders:any[]=[];
            orders.push(order);
            return this.orderManagementService.saveDocumentsForIrpOrder(createFormData(orders, documents));
          } else {
            return of(order);
          }
      }),
      catchError((error) => dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error))))
    );
  }

  @Action(EditOrder)
  EditOrder(
    { dispatch }: StateContext<OrderManagementContentStateModel>,
    { order, documents, message }: EditOrder
  ): Observable<Order | void> {
    return this.orderManagementService.editOrder(order, documents).pipe(
      tap((payload: Order) => {
        dispatch([
          new ShowToast(
            MessageTypes.Success,
            RECORD_MODIFIED_SUCCESS_WITH_ORDERID(
              payload?.organizationPrefix ?? '',
              payload?.publicId?.toString() ?? ''
            ) ?? message
          ),
          new SaveOrderSucceeded(payload),
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
        dispatch([new ShowToast(MessageTypes.Success, RECORD_DELETE), new DeleteOrderSucceeded()]);
        dispatch(new DeleteOrderSucceeded());
      }),
      catchError((error: any) => of(dispatch(new ShowToast(MessageTypes.Error, 'Order cannot be deleted'))))
    );
  }

  @Action(GetRejectReasonsForOrganisation)
  GetRejectReasonsForOrganisation(
    { patchState}: StateContext<OrderManagementContentStateModel>,
    { systemType }: GetRejectReasonsForOrganisation
    ): Observable<RejectReasonPage> {
    return this.rejectReasonService.getAllRejectReasons(systemType).pipe(
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
      }),
      catchError((error) => dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error))))
    );
  }

  @Action(cancelCandidateJobforIRP)
  cancelCandidateJobforIRP(
    { dispatch }: StateContext<OrderManagementContentStateModel>,
    { payload }: cancelCandidateJobforIRP
  ): Observable<void> {
    console.log(payload)
    return this.orderManagementService.cancelIrpCandidate(payload).pipe(
      tap(() => {
        dispatch([new ShowToast(MessageTypes.Success, RECORD_MODIFIED), new CancelOrganizationCandidateJobSuccess()]);
      }),
      catchError((error) => dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error))))
    );
  }


  @Action(ApproveOrder)
  ApproveOrder(
    { dispatch }: StateContext<OrderManagementContentStateModel>,
    { id, isIRPTab, updateOpenedOrder }: ApproveOrder
  ): Observable<string | void> {
    return this.orderManagementService.approveOrder(id, isIRPTab).pipe(
      tap(() => {
        if (updateOpenedOrder) {
          dispatch([new GetSelectedOrderById(id, isIRPTab), new ApproveOrderSucceeded()]);
        }
      }),
      catchError((error) => dispatch(new ShowToast(MessageTypes.Error, error.error)))
    );
  }

  @Action(GetOrderFilterDataSources)
  GetOrderFilterDataSources(
    { patchState }: StateContext<OrderManagementContentStateModel>,
    { isIRP }: GetOrderFilterDataSources
  ): Observable<OrderFilterDataSource> {
    return this.orderManagementService.getOrderFilterDataSources(isIRP).pipe(
      tap((payload) => {
        patchState({ orderFilterDataSources: payload });
        return payload;
      })
    );
  }

  @Action(ClearOrderFilterDataSources)
  ClearOrderFilterDataSources({
    patchState,
  }: StateContext<OrderManagementContentStateModel>): OrderManagementContentStateModel {
    return patchState({ orderFilterDataSources: null });
  }

  @Action(GetHistoricalData)
  GetHistoricalData(
    { patchState, dispatch }: StateContext<OrderManagementContentStateModel>,
    { organizationId, candidateJobId, isIrpFlag }: GetHistoricalData
  ): Observable<HistoricalEvent[]> {
    return this.orderManagementService.getHistoricalData(organizationId, candidateJobId, isIrpFlag).pipe(
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

  @Action(ExportOrders)
  ExportOrders(
    { dispatch }: StateContext<OrderManagementContentStateModel>,
    { payload, tab }: ExportOrders
  ): Observable<any> {
    return this.orderManagementService.export(payload, tab).pipe(
      tap((file) => {
        const url = window.URL.createObjectURL(file);
        saveSpreadSheetDocument(url, payload.filename || 'export', payload.exportFileType);
      }),
      catchError((error) => dispatch(new ShowToast(MessageTypes.Error, error.error)))
    );
  }

  @Action(ExportIRPOrders)
  ExportIRPOrders(
    { dispatch }: StateContext<OrderManagementContentStateModel>,
    { payload, tab }: ExportIRPOrders
  ): Observable<any> {
    return this.orderManagementService.irpexport(payload, tab).pipe(
      tap((file) => {
        const url = window.URL.createObjectURL(file);
        saveSpreadSheetDocument(url, payload.filename || 'export', payload.exportFileType);
      }),
      catchError((error) => dispatch(new ShowToast(MessageTypes.Error, error.error)))
    );
  }

  @Action(ExportOrdersJourney)
  ExportOrdersJourney(
    { }: StateContext<OrderManagementContentStateModel>,
    { payload }: ExportOrdersJourney
  ): Observable<any> {
    return this.orderManagementService.orderJourneyexport(payload).pipe(
      tap((file) => {
        const url = window.URL.createObjectURL(file);
        saveSpreadSheetDocument(url, payload.filename || 'export', payload.exportFileType);
      })
    );
  }

  @Action(DuplicateOrder)
  DuplicateOrder(
    { dispatch }: StateContext<OrderManagementContentStateModel>,
    { payload, system }: DuplicateOrder
  ): Observable<number> {
    return this.orderManagementService.duplicate(payload, system).pipe(
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

  @Action(GetOrderImportTemplate)
  GetOrderImportTemplate({ dispatch }: StateContext<OrderManagementContentStateModel>): Observable<any> {
    return this.orderImportService.getImportOrderTemplate().pipe(
      tap((payload) => {
        dispatch(new GetOrderImportTemplateSucceeded(payload));
      }),
      catchError(() => of(dispatch(new ShowToast(MessageTypes.Error, 'Cannot download the template'))))
    );
  }

  @Action(GetOrderImportErrors)
  GetOrderImportErrors(
    { dispatch }: StateContext<OrderManagementContentStateModel>,
    { payload }: GetOrderImportErrors
  ): Observable<any> {
    return this.orderImportService.getImportOrderErrors(payload).pipe(
      tap((payload) => {
        dispatch(new GetOrderImportErrorsSucceeded(payload));
      }),
      catchError(() => of(dispatch(new ShowToast(MessageTypes.Error, 'Cannot download the file'))))
    );
  }

  @Action(UploadOrderImportFile)
  UploadOrderImportFile(
    { dispatch }: StateContext<OrderManagementContentStateModel>,
    { payload }: UploadOrderImportFile
  ): Observable<OrderImportResult | Observable<void>> {
    return this.orderImportService.uploadImportOrderFile(payload).pipe(
      tap((payload) => {
        dispatch(new UploadOrderImportFileSucceeded(payload));
      }),
      catchError((error: any) =>
        of(
          dispatch(
            new ShowToast(
              MessageTypes.Error,
              error && error.error ? getAllErrors(error.error) : 'File was not uploaded'
            )
          )
        )
      )
    );
  }

  @Action(SaveOrderImportResult)
  SaveOrderImportResult(
    { dispatch }: StateContext<OrderManagementContentStateModel>,
    { payload }: SaveOrderImportResult
  ): Observable<OrderImportResult | Observable<void>> {
    return this.orderImportService.saveImportOrderResult(payload).pipe(
      tap((payload) => {
        dispatch(new SaveOrderImportResultSucceeded(payload));
      }),
      catchError(() => of(dispatch(new ShowToast(MessageTypes.Error, 'Orders were not imported'))))
    );
  }

  @Action(UpdateRegRateorder)
  UpdateRegRateorder(
    { dispatch }: StateContext<OrderManagementContentStateModel>,
    { payload, reorderFilled }: UpdateRegRateorder
  ): Observable<UpdateRegrateModel | Observable<void>> {
    return this.UpdateRegRateService.UpdateRegRate(payload).pipe(
      tap((data) => {
        const count = data.length;
        if (count > 0 && payload.perDiemIds.length === 0)
          dispatch(new ShowToast(MessageTypes.Success, UpdateRegularRatesucceedcount(count)));
        else if (count == 0 && payload.perDiemIds.length === 0)
          dispatch(new ShowToast(MessageTypes.Error, TravelerContracttoPermOrdersSucceedMessage));
        else if (payload.perDiemIds.length === payload.orderIds.length && count === payload.perDiemIds.length)
          dispatch(new ShowToast(MessageTypes.Success, reorderFilled ? UpdateRegularRateReorderOpensucceedcount(count) + UpdateReorderFilled : UpdateRegularRateReordersucceedcount(count)));
        else if (payload.perDiemIds.length === payload.orderIds.length && count > 0)
          dispatch(new ShowToast(MessageTypes.Success, reorderFilled ? UpdateRegularRateReorderOpensucceedcount(count) + UpdateReorderFilled : UpdateRegularRateReordersucceedcount(count)));
        else if (count == 0 && payload.perDiemIds.length === payload.orderIds.length)
          dispatch(new ShowToast(MessageTypes.Error, ReOrdersErrorMessage));
        else if (count > 0 && payload.perDiemIds.length > 0)
          dispatch(new ShowToast(MessageTypes.Success, UpdateRegularRatesucceedcount(count)));
        else if (count == 0 && payload.perDiemIds.length !== payload.orderIds.length && payload.perDiemIds.length > 0)
          dispatch(new ShowToast(MessageTypes.Error, PerDiemErrorMessage));
        else
          dispatch(new ShowToast(MessageTypes.Error, 'Bill rate is not updated'));
      }),
      catchError(() => of(dispatch(new ShowToast(MessageTypes.Error, 'Bill rate is not updated'))))
    );
  }

  @Action(GetCandidateCancellationReason)
  GetCandidateCancellationReason(
    { patchState }: StateContext<OrderManagementContentStateModel>,
    { orderId }: GetCandidateCancellationReason
  ): Observable<CandidateCancellationReason[] | null> {
    return this.orderManagementService.getCandidateCancellationReasons(orderId).pipe(
      tap((payload: CandidateCancellationReason[]) => {
        patchState({ candidateCancellationReasons: payload });
      })
    );
  }

  @Action(ClearCandidateCancellationReason)
  ClearCandidateCancellationReason({ patchState }: StateContext<OrderManagementContentStateModel>): void {
    patchState({ candidateCancellationReasons: null });
  }

  @Action(GetOrderComments)
  GetOrderComments(
    { patchState }: StateContext<OrderManagementContentStateModel>,
    { commentContainerId }: GetOrderComments
  ): Observable<Comment[]> {
    return this.commentService
      .getComments(commentContainerId, null)
      .pipe(tap((payload) => patchState({ orderComments: payload })));
  }

  @Action(GetAllShifts)
  GetAllShifts(
    { patchState }: StateContext<OrderManagementContentStateModel>,
    { }: GetAllShifts
  ): Observable<ScheduleShift[] | null> {
    return this.orderManagementService.getAllShifts().pipe(
      tap((payload: ScheduleShift[]) => {
        patchState({ allShifts: payload });
        return payload;
      })
    );
  }

  @Action(sendOnboardCandidateEmailMessage)
  sendOnboardCandidateEmailMessage(
    { dispatch, patchState }: StateContext<OrderManagementContentStateModel>,
    { onboardCandidateEmailData }: sendOnboardCandidateEmailMessage
  ): Observable<any | void> {
    return this.orderManagementService.sendCandidateOnboardEmail(onboardCandidateEmailData).pipe(
      tap((payload) => {
        patchState({ sendOnboardCandidateEmail: payload });
        return payload;
      }),
      catchError((error: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, error.error));
      })
    );
  }

  @Action(GetOrderAuditHistory)
  GetOrderAuditHistory({ patchState, dispatch }: StateContext<OrderManagementContentStateModel>, { payload }:
    GetOrderAuditHistory): Observable<OrderAuditHistory[] | void> {
    return this.orderManagementService.getOrderAuditHistory(payload).pipe(
      tap((payloads) => {
        patchState({ OrderAuditHistory: payloads });
        dispatch(new GetOrderHistoryDetailSucceeded());
        return payloads;
      }),
      catchError((error: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)));
      }));
  }

  @Action(GetOrderCredentialAuditHistory)
  GetOrderCredentialAuditHistory({ patchState, dispatch }: StateContext<OrderManagementContentStateModel>, { payload }:
    GetOrderCredentialAuditHistory): Observable<OrderCredentialAuditHistory[]|void> {
    return this.orderManagementService.getOrderCredentialAuditHistory(payload).pipe(
      tap((payloads) => {
        patchState({ OrderCredentialAuditHistory: payloads });
        dispatch(new GetOrderCredentialDetailSucceeded());
        return payloads;
      }),
      catchError((error: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)));
      }));
  }


  @Action(GetOrderBillRatesAuditHistory)
  GetOrderBillRatesAuditHistory({ patchState, dispatch }: StateContext<OrderManagementContentStateModel>, { payload }:
    GetOrderBillRatesAuditHistory): Observable<OrderBillRateAuditHistory[]|void> {
    return this.orderManagementService.getOrderBillRatesAuditHistory(payload).pipe(
      tap((payloads) => {
        patchState({ OrderBillRatesAuditHistory: payloads });
        dispatch(new GetOrderBillRateDetailSucceeded());
        return payloads;
      }),
      catchError((error: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)));
      }));
  }


  @Action(GetOrderContactAuditHistory)
  GetOrderContactAuditHistory({ patchState,dispatch }: StateContext<OrderManagementContentStateModel>, { payload }:
    GetOrderContactAuditHistory): Observable<OrderContactAuditHistory[]|void> {
    return this.orderManagementService.getOrderContactAuditHistory(payload).pipe(
      tap((payloads) => {
        patchState({ OrderContactAuditHistory: payloads });
        dispatch(new GetOrderContactDetailSucceeded());
        return payloads;
      }),
      catchError((error: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)));
      }));
  }

  @Action(GetOrderWorkLocationAuditHistory)
  GetOrderWorkLocationAuditHistory({ patchState, dispatch }: StateContext<OrderManagementContentStateModel>, { payload }:
    GetOrderWorkLocationAuditHistory): Observable<OrderWorkLocationAuditHistory[] | void> {
    return this.orderManagementService.GetOrderWorkLocationAuditHistory(payload).pipe(
      tap((payloads) => {
        patchState({ OrderWorkLocationAuditHistory: payloads });
        dispatch(new GetOrderWorkLocationDetailSucceeded());
        return payloads;
      }),
      catchError((error: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)));
      }));
  }


  @Action(GetOrderJobDistributionAuditHistory)
  GetOrderJobDistributionAuditHistory({ patchState, dispatch }: StateContext<OrderManagementContentStateModel>, { payload }:
    GetOrderJobDistributionAuditHistory): Observable<OrderJobDistributionAuditHistory[] | void> {
    return this.orderManagementService.getOrderJobDistributionAuditHistory(payload).pipe(
      tap((payloads) => {
        patchState({ OrderJobDistributionAuditHistory: payloads });
        dispatch(new GetOrderJobDistributionDetailSucceeded());
        return payloads;
      }),
      catchError((error: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)));
      }));
  }

  @Action(GetOrderClassificationAuditHistory)
  GetOrderClassificationAuditHistory({ patchState, dispatch }: StateContext<OrderManagementContentStateModel>, { payload }:
    GetOrderClassificationAuditHistory): Observable<OrderClassificationAuditHistory[] | void> {
    return this.orderManagementService.getOrderClassificationAuditHistory(payload).pipe(
      tap((payloads) => {
        patchState({ OrderClassificationAuditHistory: payloads });
        dispatch(new GetOrderClassificationDetailSucceeded());
        return payloads;
      }),
      catchError((error: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)));
      }));
  }

  @Action(SaveClearToStart)
  SaveClearToStart(
    { dispatch }: StateContext<OrderManagementContentStateModel>,
    { payload }: SaveClearToStart
  ): Observable<any | Observable<void>> {
    return this.orderManagementService.saveClearToStart(payload).pipe(
      tap((payload) => {
        dispatch(new SaveClearToStartSucceeded(true));
        return payload;
      }),
      catchError(() => of(dispatch(new ShowToast(MessageTypes.Error, 'Orders were not imported'))))
    );
  }
}
