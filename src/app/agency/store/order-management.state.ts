import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { catchError, Observable, of, tap } from 'rxjs';

import { isUndefined } from 'lodash';

import { DialogNextPreviousOption } from '@shared/components/dialog-next-previous/dialog-next-previous.component';
import { RECORD_MODIFIED } from '@shared/constants';
import { MessageTypes } from '@shared/enums/message-types';
import { OrderApplicantsInitialData } from '@shared/models/order-applicants.model';

import {
  AgencyOrderManagement,
  AgencyOrderManagementPage,
  OrderCandidateJob,
  OrderCandidatesListPage,
} from '@shared/models/order-management.model';
import { Order } from '@shared/models/order-management.model';
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
  GetAgencyFilterOptions,
  GetAgencyOrderCandidatesList,
  GetAgencyOrderGeneralInformation,
  GetAgencyOrdersPage,
  GetCandidateJob,
  GetOrderApplicantsData,
  GetOrderById,
  GetOrganizationStructure,
  GetRejectReasonsForAgency,
  RejectCandidateForAgencySuccess,
  RejectCandidateJob,
  UpdateAgencyCandidateJob,
} from './order-management.actions';
import { AgencyOrderFilteringOptions } from '@shared/models/agency.model';
import { OrderFilteringOptionsService } from '@shared/services/order-filtering-options.service';
import { HistoricalEvent } from '@shared/models/historical-event.model';
import { GetHistoricalData } from '@client/store/order-managment-content.actions';
import { ApplicantStatus } from '@shared/enums/applicant-status.enum';
import {
  OrganizationDepartment,
  OrganizationLocation,
  OrganizationRegion,
  OrganizationStructure,
} from '@shared/models/organization.model';
import { OrganizationService } from '@shared/services/organization.service';
import { getRegionsFromOrganizationStructure } from '@agency/order-management/order-management-grid/agency-order-filters/agency-order-filters.utils';

export interface OrderManagementModel {
  ordersPage: AgencyOrderManagementPage | null;
  orderCandidatesListPage: OrderCandidatesListPage | null;
  orderCandidatesInformation: Order | null;
  candidatesJob: OrderCandidateJob | null;
  orderApplicantsInitialData: OrderApplicantsInitialData | null;
  selectedOrder: Order | null;
  orderDialogOptions: DialogNextPreviousOption;
  historicalEvents: HistoricalEvent[] | null;
  rejectionReasonsList: RejectReason[];
  orderFilteringOptions: AgencyOrderFilteringOptions | null;
  organizationStructure: OrganizationStructure[];
}

@State<OrderManagementModel>({
  name: 'agencyOrders',
  defaults: {
    ordersPage: null,
    orderCandidatesListPage: null,
    orderCandidatesInformation: null,
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
    historicalEvents: null,
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
        (candidate) => candidate.status !== ApplicantStatus.Rejected && candidate.status !== ApplicantStatus.NotApplied
      ).length || 0
    );
  }

  @Selector()
  static orderCandidatesInformation(state: OrderManagementModel): Order | null {
    return state.orderCandidatesInformation;
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

  constructor(
    private orderManagementContentService: OrderManagementContentService,
    private rejectReasonService: RejectReasonService,
    private orderApplicantsService: OrderApplicantsService,
    private orderFilteringOptionsService: OrderFilteringOptionsService,
    private organizationService: OrganizationService
  ) {}

  @Action(GetAgencyOrdersPage)
  GetAgencyOrdersPage(
    { patchState }: StateContext<OrderManagementModel>,
    { pageNumber, pageSize, filters }: GetAgencyOrdersPage
  ): Observable<AgencyOrderManagementPage> {
    return this.orderManagementContentService.getAgencyOrders(pageNumber, pageSize, filters).pipe(
      tap((payload) => {
        patchState({ ordersPage: payload });
        return payload;
      })
    );
  }

  @Action(GetAgencyOrderCandidatesList)
  GetAgencyOrderCandidatesPage(
    { patchState }: StateContext<OrderManagementModel>,
    { orderId, organizationId, pageNumber, pageSize, includeDeployed }: GetAgencyOrderCandidatesList
  ): Observable<OrderCandidatesListPage> {
    return this.orderManagementContentService
      .getAgencyOrderCandidatesList(orderId, organizationId, pageNumber, pageSize, includeDeployed)
      .pipe(
        tap((payload) => {
          patchState({ orderCandidatesListPage: payload });
          return payload;
        })
      );
  }

  @Action(GetAgencyOrderGeneralInformation)
  GetAgencyOrderGeneralInformation(
    { patchState }: StateContext<OrderManagementModel>,
    { id, organizationId }: GetAgencyOrderGeneralInformation
  ): Observable<Order> {
    return this.orderManagementContentService.getAgencyOrderGeneralInformation(id, organizationId).pipe(
      tap((payload) => {
        patchState({ orderCandidatesInformation: payload });
        return payload;
      })
    );
  }

  @Action(GetOrderById)
  GetOrderById(
    { patchState }: StateContext<OrderManagementModel>,
    { id, organizationId, options }: GetOrderById
  ): Observable<Order> {
    patchState({ orderDialogOptions: options });
    return this.orderManagementContentService.getAgencyOrderById(id, organizationId).pipe(
      tap((payload) => {
        const groupedCredentials = getGroupedCredentials(payload.credentials);
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

  @Action(UpdateAgencyCandidateJob)
  UpdateAgencyCandidateJob(
    { dispatch }: StateContext<OrderManagementModel>,
    { payload }: UpdateAgencyCandidateJob
  ): Observable<any> {
    return this.orderManagementContentService.updateCandidateJob(payload).pipe(
      tap(() => dispatch(new ShowToast(MessageTypes.Success, 'Status was updated'))),
      catchError(() => of(dispatch(new ShowToast(MessageTypes.Error, 'Status cannot be updated'))))
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
        dispatch([new ShowToast(MessageTypes.Success, RECORD_MODIFIED), new RejectCandidateForAgencySuccess()]);
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

  @Action(GetHistoricalData)
  GetHistoricalData(
    { patchState }: StateContext<OrderManagementModel>,
    { organizationId, candidateJobId }: GetHistoricalData
  ): Observable<HistoricalEvent[]> {
    return this.orderManagementContentService.getHistoricalData(organizationId, candidateJobId).pipe(
      tap((payload) => {
        patchState({ historicalEvents: payload });
        return payload;
      }),
      catchError(() => {
        patchState({ historicalEvents: [] });
        return of();
      })
    );
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
}
