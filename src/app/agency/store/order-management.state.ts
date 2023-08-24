import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { catchError, map, Observable, of, tap } from 'rxjs';

import { isUndefined } from 'lodash';

import { DialogNextPreviousOption } from '@shared/components/dialog-next-previous/dialog-next-previous.component';
import { RECORD_MODIFIED } from '@shared/constants';
import { MessageTypes } from '@shared/enums/message-types';
import { OrderApplicantsInitialData } from '@shared/models/order-applicants.model';

import {
  AgencyOrderManagement,
  AgencyOrderManagementPage,
  Order,
  OrderCandidateJob,
  OrderCandidatesListPage,
  ApplicantStatus as ApStatus,
} from '@shared/models/order-management.model';
import { RejectReason, RejectReasonPage } from '@shared/models/reject-reason.model';
import { OrderApplicantsService } from '@shared/services/order-applicants.service';
import { OrderManagementContentService } from '@shared/services/order-management-content.service';
import { getGroupedCredentials } from '@shared/components/order-details/order.utils';
import { RejectReasonService } from '@shared/services/reject-reason.service';
import { getAllErrors } from '@shared/utils/error.utils';
import { ShowToast } from 'src/app/store/app.actions';
import {
  ApplyOrderApplicants,
  ApplyOrderApplicantsSucceed,
  ClearAgencyHistoricalData,
  ClearAgencyOrderCandidatesList,
  ClearAgencyCandidateJob,
  ClearDeployedCandidateOrderInfo,
  ClearOrders,
  ExportAgencyOrders,
  GetAgencyExtensions,
  GetAgencyFilterOptions,
  GetAgencyHistoricalData,
  GetAgencyOrderCandidatesList,
  GetAgencyOrdersPage,
  GetCandidateJob,
  GetDeployedCandidateOrderInfo,
  GetOrderApplicantsData,
  GetOrderById,
  GetOrganizationStructure,
  GetRejectReasonsForAgency,
  RejectCandidateForAgencySuccess,
  RejectCandidateJob,
  SetOrdersTab,
  UpdateAgencyCandidateJob,
  ClearOrganizationStructure,
  ReloadOrderCandidatesLists,
  GetAgencyAvailableSteps,
} from './order-management.actions';
import { AgencyOrderFilteringOptions } from '@shared/models/agency.model';
import { OrderFilteringOptionsService } from '@shared/services/order-filtering-options.service';
import { HistoricalEvent } from '@shared/models/historical-event.model';
import { ApplicantStatus } from '@shared/enums/applicant-status.enum';
import { OrganizationRegion, OrganizationStructure } from '@shared/models/organization.model';
import { OrganizationService } from '@shared/services/organization.service';
import { getRegionsFromOrganizationStructure } from '@agency/order-management/order-management-grid/agency-order-filters/agency-order-filters.utils';
import { saveSpreadSheetDocument } from '@shared/utils/file.utils';
import { AgencyOrderManagementTabs } from '@shared/enums/order-management-tabs.enum';
import { ExtensionGridModel } from '@shared/components/extension/extension-sidebar/models/extension.model';
import { OrderManagementContentStateModel } from '@client/store/order-managment-content.state';
import { ExtensionSidebarService } from '@shared/components/extension/extension-sidebar/extension-sidebar.service';
import { DeployedCandidateOrderInfo } from '@shared/models/deployed-candidate-order-info.model';

export interface OrderManagementModel {
  ordersPage: AgencyOrderManagementPage | null;
  orderCandidatesListPage: OrderCandidatesListPage | null;
  candidatesJob: OrderCandidateJob | null;
  orderApplicantsInitialData: OrderApplicantsInitialData | null;
  selectedOrder: Order | null;
  orderDialogOptions: DialogNextPreviousOption;
  historicalEvents: HistoricalEvent[] | null;
  rejectionReasonsList: RejectReason[];
  orderFilteringOptions: AgencyOrderFilteringOptions | null;
  organizationStructure: OrganizationStructure[];
  ordersTab: AgencyOrderManagementTabs;
  extensions: any;
  deployedCandidateOrderInfo: DeployedCandidateOrderInfo[];
  applicantStatuses: ApStatus[];
}

@State<OrderManagementModel>({
  name: 'agencyOrders',
  defaults: {
    ordersPage: null,
    orderCandidatesListPage: null,
    orderApplicantsInitialData: null,
    selectedOrder: null,
    candidatesJob: null,
    rejectionReasonsList: [],
    orderDialogOptions: {
      next: false,
      previous: false,
    },
    orderFilteringOptions: null,
    organizationStructure: [],
    historicalEvents: [],
    ordersTab: AgencyOrderManagementTabs.MyAgency,
    extensions: null,
    deployedCandidateOrderInfo: [],
    applicantStatuses: [],
  },
})
@Injectable()
export class OrderManagementState {
  @Selector()
  static ordersPage(state: OrderManagementModel): AgencyOrderManagementPage | null {
    return state.ordersPage;
  }

  @Selector()
  static orderCandidatePage(state: OrderManagementModel): OrderCandidatesListPage | null {
    return state.orderCandidatesListPage;
  }

  @Selector()
  static orderCandidatesLenght(state: OrderManagementModel): number {
    return (
      state.orderCandidatesListPage?.items.filter(
        (candidate) =>
          candidate.status !== ApplicantStatus.Rejected &&
          candidate.status !== ApplicantStatus.NotApplied &&
          candidate.status !== ApplicantStatus.Withdraw
      ).length || 0
    );
  }

  @Selector()
  static selectedOrder(state: OrderManagementModel): Order | null {
    return state.selectedOrder;
  }

  @Selector()
  static rejectionReasonsList(state: OrderManagementModel): RejectReason[] {
    return state.rejectionReasonsList;
  }

  @Selector()
  static orderApplicantsInitialData(state: OrderManagementModel): OrderApplicantsInitialData | null {
    return state.orderApplicantsInitialData;
  }

  @Selector()
  static orderDialogOptions(state: OrderManagementModel): DialogNextPreviousOption {
    return state.orderDialogOptions;
  }

  @Selector()
  static lastSelectedOrder(state: OrderManagementModel): (id: number) => [AgencyOrderManagement, number] | [] {
    return (id: number) => {
      let rowIndex;
      const order = state.ordersPage?.items.find(({ orderId }, index) => {
        rowIndex = index;
        return orderId === id;
      });
      return order && !isUndefined(rowIndex) ? [order, rowIndex] : [];
    };
  }

  @Selector()
  static candidatesJob(state: OrderManagementModel): OrderCandidateJob | null {
    return state.candidatesJob;
  }

  @Selector()
  static orderFilteringOptions(state: OrderManagementModel): AgencyOrderFilteringOptions | null {
    return state.orderFilteringOptions;
  }

  @Selector()
  static candidateHistoricalData(state: OrderManagementModel): HistoricalEvent[] | null {
    return state.historicalEvents;
  }

  @Selector()
  static gridFilterRegions(state: OrderManagementModel): OrganizationRegion[] {
    return getRegionsFromOrganizationStructure(state.organizationStructure);
  }

  @Selector()
  static ordersTab(state: OrderManagementModel): AgencyOrderManagementTabs | null {
    return state.ordersTab;
  }
  @Selector()
  static organizationStructure(state: OrderManagementModel): OrganizationStructure[] | null {
    return state.organizationStructure;
  }

  @Selector()
  static extensions(state: OrderManagementContentStateModel): any | null {
    return state.extensions;
  }

  @Selector()
  static deployedCandidateOrderInfo(state: OrderManagementModel): DeployedCandidateOrderInfo[] {
    return state.deployedCandidateOrderInfo;
  }

  @Selector()
  static availableSteps(state: OrderManagementModel): ApStatus[] {
    return state.applicantStatuses;
  }

  constructor(
    private orderManagementContentService: OrderManagementContentService,
    private rejectReasonService: RejectReasonService,
    private orderApplicantsService: OrderApplicantsService,
    private orderFilteringOptionsService: OrderFilteringOptionsService,
    private organizationService: OrganizationService,
    private extensionSidebarService: ExtensionSidebarService
  ) {}

  @Action(GetAgencyOrdersPage, { cancelUncompleted: true })
  GetAgencyOrdersPage(
    { patchState }: StateContext<OrderManagementModel>,
    { pageNumber, pageSize, filters }: GetAgencyOrdersPage
  ): Observable<AgencyOrderManagementPage> {
    return this.orderManagementContentService.getAgencyOrders(pageNumber, pageSize, filters).pipe(
      tap((payload) => {
        this.orderManagementContentService.countShiftsWithinPeriod(payload);
        patchState({ ordersPage: payload });
        return payload;
      })
    );
  }

  @Action(GetAgencyOrderCandidatesList)
  GetAgencyOrderCandidatesPage(
    { patchState }: StateContext<OrderManagementModel>,
    { orderId, organizationId, pageNumber, pageSize, excludeDeployed, searchTerm }: GetAgencyOrderCandidatesList
  ): Observable<OrderCandidatesListPage> {
    return this.orderManagementContentService
      .getAgencyOrderCandidatesList(orderId, organizationId, pageNumber, pageSize, excludeDeployed, searchTerm)
      .pipe(
        tap((payload) => {
          patchState({ orderCandidatesListPage: payload });
          return payload;
        })
      );
  }

  @Action(ClearAgencyOrderCandidatesList)
  ClearAgencyOrderCandidatesList({ patchState }: StateContext<OrderManagementModel>): void {
    patchState({ orderCandidatesListPage: null });
  }

  @Action(GetOrderById)
  GetOrderById(
    { patchState }: StateContext<OrderManagementModel>,
    { id, organizationId, options }: GetOrderById
  ): Observable<Order> {
    patchState({ orderDialogOptions: options });
    return this.orderManagementContentService.getAgencyOrderById(id, organizationId).pipe(
      tap((payload) => {
        const groupedCredentials = getGroupedCredentials(payload.credentials ?? payload.reOrderFrom?.credentials);
        payload.groupedCredentials = groupedCredentials;
        patchState({ selectedOrder: payload });
        return payload;
      })
    );
  }

  @Action(GetOrderApplicantsData)
  GetOrderApplicantsData(
    { patchState }: StateContext<OrderManagementModel>,
    { orderId, organizationId, candidateId }: GetOrderApplicantsData
  ): Observable<OrderApplicantsInitialData> {
    return this.orderApplicantsService.getOrderApplicantsData(orderId, organizationId, candidateId).pipe(
      tap((payload) => {
        patchState({ orderApplicantsInitialData: payload });
        return payload;
      })
    );
  }

  @Action(ApplyOrderApplicants)
  ApplyOrderApplicants(
    { dispatch }: StateContext<OrderManagementModel>,
    { payload }: ApplyOrderApplicants
  ): Observable<any> {
    return this.orderApplicantsService.applyOrderApplicants(payload).pipe(
      tap(() => {
        dispatch(new ShowToast(MessageTypes.Success, 'Status was updated'));
        dispatch(new ApplyOrderApplicantsSucceed());
      }),
      catchError((error: HttpErrorResponse) => dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error))))
    );
  }

  @Action(GetCandidateJob)
  GetCandidateJob(
    { patchState }: StateContext<OrderManagementModel>,
    { organizationId, jobId }: GetCandidateJob
  ): Observable<OrderCandidateJob> {
    return this.orderManagementContentService.getCandidateJob(organizationId, jobId).pipe(
      tap((payload) => {
        patchState({ candidatesJob: payload });
        return payload;
      })
    );
  }

  @Action(ClearAgencyCandidateJob)
  ClearAgencyCandidateJob({ patchState }: StateContext<OrderManagementModel>): void {
    patchState({ candidatesJob: null });
  }

  @Action(UpdateAgencyCandidateJob)
  UpdateAgencyCandidateJob(
    { dispatch }: StateContext<OrderManagementModel>,
    { payload }: UpdateAgencyCandidateJob
  ): Observable<any> {
    return this.orderManagementContentService.updateCandidateJob(payload).pipe(
      tap(() => dispatch(new ShowToast(MessageTypes.Success, 'Candidate was updated'))),
      catchError((error) => {
        const errorMessage = error?.error?.errors?.CandidateBillRate?.[0] ?? getAllErrors(error.error);
        return of(dispatch(new ShowToast(MessageTypes.Error, errorMessage)));
      })
    );
  }

  @Action(GetRejectReasonsForAgency)
  GetRejectReasonsForAgency({ patchState }: StateContext<OrderManagementModel>): Observable<RejectReasonPage> {
    return this.rejectReasonService.getAllRejectReasons().pipe(
      tap((reasons) => {
        patchState({ rejectionReasonsList: reasons.items });
        return reasons;
      })
    );
  }

  @Action(RejectCandidateJob)
  RejectCandidateJob(
    { dispatch }: StateContext<OrderManagementModel>,
    { payload }: RejectCandidateJob
  ): Observable<void> {
    return this.orderManagementContentService.rejectCandidateJob(payload).pipe(
      tap(() => {
        dispatch([
            new ShowToast(MessageTypes.Success, RECORD_MODIFIED),
            new RejectCandidateForAgencySuccess(),
            new ReloadOrderCandidatesLists(),
          ]);
      })
    );
  }

  @Action(GetAgencyFilterOptions)
  GetAgencyFilterOptions({ patchState }: StateContext<OrderManagementModel>): Observable<AgencyOrderFilteringOptions> {
    return this.orderFilteringOptionsService.getAgencyOptions().pipe(
      tap((payload) => {
        patchState({ orderFilteringOptions: payload });
      })
    );
  }

  @Action(GetAgencyHistoricalData)
  GetAgencyHistoricalData(
    { patchState, dispatch }: StateContext<OrderManagementModel>,
    { organizationId, candidateJobId }: GetAgencyHistoricalData
  ): Observable<HistoricalEvent[]> {
    return this.orderManagementContentService.getHistoricalData(organizationId, candidateJobId).pipe(
      tap((payload) => {
        patchState({ historicalEvents: payload });
        return payload;
      }),
      catchError(() => {
        dispatch(new ClearAgencyHistoricalData());
        return of();
      })
    );
  }

  @Action(ClearAgencyHistoricalData)
  ClearAgencyHistoricalData({ patchState }: StateContext<OrderManagementModel>): void {
    patchState({ historicalEvents: [] });
  }

  @Action(GetOrganizationStructure)
  GetOrganizationStructure(
    { patchState }: StateContext<OrderManagementModel>,
    { organizationIds }: GetOrganizationStructure
  ): Observable<OrganizationStructure[]> {
    return this.organizationService
      .getOrganizationsStructure(organizationIds)
      .pipe(tap((payload) => patchState({ organizationStructure: payload })));
  }

  @Action(ClearOrganizationStructure)
    ClearOrganizationStructure(
      { patchState }: StateContext<OrderManagementModel>
    ): OrderManagementModel {
      return patchState({organizationStructure: []})
    }

  @Action(ExportAgencyOrders)
  ExportAgencyOrders({}: StateContext<OrderManagementModel>, { payload }: ExportAgencyOrders): Observable<Blob> {
    return this.orderManagementContentService.exportAgency(payload).pipe(
      tap((file) => {
        const url = window.URL.createObjectURL(file);
        saveSpreadSheetDocument(url, payload.filename || 'export', payload.exportFileType);
      })
    );
  }

  @Action(SetOrdersTab)
  setOrdersTab({ patchState }: StateContext<OrderManagementModel>, { tabName }: SetOrdersTab): void {
    patchState({ ordersTab: tabName });
  }

  @Action(ClearOrders)
  ClearOrders({ patchState }: StateContext<OrderManagementModel>, {}: ClearOrders): OrderManagementModel {
    return patchState({ ordersPage: null });
  }

  @Action(GetAgencyExtensions)
  GetAgencyExtensions(
    { patchState }: StateContext<OrderManagementModel>,
    { id, orderId, organizationId }: GetAgencyExtensions
  ): Observable<ExtensionGridModel[]> {
    return this.extensionSidebarService
      .getExtensions(id, orderId, organizationId)
      .pipe(tap((extensions) => patchState({ extensions })));
  }

  @Action(GetDeployedCandidateOrderInfo)
  GetDeployedCandidateOrderInfo(
    { patchState }: StateContext<OrderManagementModel>,
    { orderId, candidateProfileId, organizationId }: GetDeployedCandidateOrderInfo
  ): Observable<DeployedCandidateOrderInfo[]> {
    return this.orderApplicantsService.getDeployedCandidateOrderInfo(orderId, candidateProfileId, organizationId).pipe(
      map((data: DeployedCandidateOrderInfo[]) =>
        data.map((dto) => ({
          ...dto,
          orderPublicId: dto.orgPrefix + '-' + dto.orderPublicId,
        }))
      ),
      tap((orderInfo) => patchState({ deployedCandidateOrderInfo: orderInfo }))
    );
  }

  @Action(ClearDeployedCandidateOrderInfo)
  ClearDeployedCandidateOrderInfo({ patchState }: StateContext<OrderManagementModel>): OrderManagementModel {
    return patchState({ deployedCandidateOrderInfo: [] });
  }

  @Action(GetAgencyAvailableSteps)
  GetAvailableSteps(
    { patchState }: StateContext<OrderManagementContentStateModel>,
    { organizationId, jobId }: GetAgencyAvailableSteps
  ): Observable<ApStatus[]> {
    return this.orderManagementContentService.getAvailableSteps(organizationId, jobId).pipe(
      tap((payload) => {
        patchState({ applicantStatuses: payload });
      }),
    );
  }
}
