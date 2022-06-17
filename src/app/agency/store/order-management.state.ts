import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { DialogNextPreviousOption } from '@shared/components/dialog-next-previous/dialog-next-previous.component';
import { MessageTypes } from "@shared/enums/message-types";
import { OrderApplicantsInitialData } from "@shared/models/order-applicants.model";

import {
  AgencyOrderManagement,
  AgencyOrderManagementPage,
  OrderCandidateJob,
  OrderCandidatesListPage
} from '@shared/models/order-management.model';
import { Order } from '@shared/models/order-management.model';
import { OrderApplicantsService } from "@shared/services/order-applicants.service";
import { OrderManagementContentService } from '@shared/services/order-management-content.service';
import { getGroupedCredentials } from '@shared/components/order-details/order.utils';
import { catchError, Observable, of, tap } from 'rxjs';
import { ShowToast } from "src/app/store/app.actions";
import {
  ApplyOrderApplicants,
  ApplyOrderApplicantsSucceed,
  GetAgencyOrderCandidatesList,
  GetAgencyOrderGeneralInformation,
  GetAgencyOrdersPage,
  GetCandidateJob,
  GetOrderApplicantsData,
  GetOrderById,
  UpdateAgencyCandidateJob
} from './order-management.actions';
import { isUndefined } from 'lodash';

export interface OrderManagementModel {
  ordersPage: AgencyOrderManagementPage | null;
  orderCandidatesListPage: OrderCandidatesListPage | null;
  orderCandidatesInformation: Order | null;
  candidatesJob: OrderCandidateJob | null;
  orderApplicantsInitialData: OrderApplicantsInitialData | null;
  selectedOrder: Order | null;
  orderDialogOptions: DialogNextPreviousOption;
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
    orderDialogOptions: {
      next: false,
      previous: false
    }
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
    return state.orderCandidatesListPage?.items.length || 0;
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

  constructor(private orderManagementContentService: OrderManagementContentService,
              private orderApplicantsService: OrderApplicantsService) {}

  @Action(GetAgencyOrdersPage)
  GetAgencyOrdersPage(
    { patchState }: StateContext<OrderManagementModel>,
    { pageNumber, pageSize }: GetAgencyOrdersPage
  ): Observable<AgencyOrderManagementPage> {
    return this.orderManagementContentService.getAgencyOrders(pageNumber, pageSize).pipe(
      tap((payload) => {
        patchState({ ordersPage: payload});
        return payload;
      })
    );
  }

  @Action(GetAgencyOrderCandidatesList)
  GetAgencyOrderCandidatesPage(
    { patchState }: StateContext<OrderManagementModel>,
    { orderId, organizationId, pageNumber, pageSize }: GetAgencyOrderCandidatesList
  ): Observable<OrderCandidatesListPage> {
    return this.orderManagementContentService.getAgencyOrderCandidatesList(orderId,organizationId,pageNumber,pageSize).pipe(
      tap((payload) => {
        patchState({orderCandidatesListPage: payload});
        return payload
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
        patchState({orderCandidatesInformation: payload});
        return payload;
      })
    )
  }

  @Action(GetOrderById)
  GetOrderById(
    { patchState }: StateContext<OrderManagementModel>,
    { id, organizationId, options }: GetOrderById
  ): Observable<Order> {
    patchState({ orderDialogOptions: options});
    return this.orderManagementContentService.getAgencyOrderById(id, organizationId).pipe(
      tap((payload) => {
        const groupedCredentials = getGroupedCredentials(payload.credentials)
        payload.groupedCredentials = groupedCredentials;
        patchState({ selectedOrder: payload});
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
        patchState({orderApplicantsInitialData: payload});
        return payload
      })
    );
  }

  @Action(ApplyOrderApplicants)
  ApplyOrderApplicants({ dispatch }: StateContext<OrderManagementModel>, { payload }: ApplyOrderApplicants): Observable<any> {
    return this.orderApplicantsService.applyOrderApplicants(payload).pipe(
      tap(() => {
        dispatch(new ShowToast(MessageTypes.Success, 'Status was updated'));
        dispatch(new ApplyOrderApplicantsSucceed());
      }),
      catchError(() => of(dispatch(new ShowToast(MessageTypes.Error, 'Status cannot be updated'))))
    );
  }

  @Action(GetCandidateJob)
  GetCandidateJob(
    { patchState }: StateContext<OrderManagementModel>,
    { organizationId, jobId }: GetCandidateJob
  ): Observable<OrderCandidateJob> {
      return this.orderManagementContentService.getCandidateJob(organizationId, jobId).pipe(
        tap((payload) => {
          patchState({candidatesJob: payload});
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
}
