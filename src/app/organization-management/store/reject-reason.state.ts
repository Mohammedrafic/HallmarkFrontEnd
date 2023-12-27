import { Action, Selector, State, StateContext } from "@ngxs/store";
import { Injectable } from "@angular/core";
import { RejectReasonService } from "@shared/services/reject-reason.service";
/**
 * TODO: use es6 modules.
 */
import {
  GetClosureReasonsByPage,
  GetManualInvoiceRejectReasonsByPage,
  GetRejectReasonsByPage,
  RemoveClosureReasons,
  RemoveManualInvoiceRejectReason,
  RemoveRejectReasons,
  SaveClosureReasons,
  SaveClosureReasonsError,
  CreateManualInvoiceRejectReason,
  SaveManualInvoiceRejectReasonError,
  SaveRejectReasons,
  SaveRejectReasonsError,
  SaveRejectReasonsSuccess,
  UpdateClosureReasonsSuccess,
  UpdateManualInvoiceRejectReason,
  UpdateManualInvoiceRejectReasonSuccess,
  UpdateRejectReasons,
  UpdateRejectReasonsSuccess,
  RemoveOrderRequisition,
  UpdateOrderRequisitionSuccess,
  GetOrderRequisitionByPage,
  SaveOrderRequisition,
  SaveOrderRequisitionError,
  GetPenaltiesByPage,
  SavePenalty,
  SavePenaltySuccess,
  SavePenaltyError,
  RemovePenalty,
  ShowOverridePenaltyDialog,
  GetUnavailabilityReasons,
  SaveUnavailabilityReason,
  RemoveUnavailabilityReason,
  GetInternalTransferReasons,
  SaveInternalTransferReasons,
  RemoveInternalTransferReasons,
  UpdateInternalTransferReasons,
  UpdateInternalTransferReasonsSuccess,
  GetInactivationReasons,
  SaveInactivationReasons,
  RemoveInactivationReasons,
  UpdateInactivationReasons,
  UpdateInactivationReasonsSuccess,
  GetCategoryNoteReasons,
  SaveCategoryNoteReasons,
  RemoveCategoryNoteReasons,
  UpdateCategoryNoteReasons,
  UpdateCategoryNoteReasonsSuccess,
  SaveInactivatedReasonError,
  UpdateInternalTransferReasonsError,
  UpdateCategoryNoteReasonsError,
  GetSourcingReasons,
  GetRecuriterReasonsByPage,
  SaveRecuriterReasons,
  SaveRecuriterReasonsSuccess,
  SaveRecuriterReasonsError,
  RemoveRecuriterReasons,
  UpdateRecuriterReasonsSuccess,
  SaveSourcingReasonsError,
  UpdateSourcingReasonsSuccess,
  GetSourcingReasonsByPage,
  SaveSourcingReasons,
  RemoveSourcingReasons,
  UpdateSourcingReasons,
  UpdateRecuriterReasons,
  GetSourcingConfig,
  SaveCancelEmployeeReason,
  GetCancelEmployeeReason,
  RemoveCancelEmployeeReason,
} from "@organization-management/store/reject-reason.actions";
import { catchError, map, Observable, tap } from "rxjs";
import {
  CancelEmployeeReasons,
  RecuriterReasonPage,
  RejectReason,
  RejectReasonPage,
  RejectReasonwithSystem,
  SourcingReasonPage,
  UnavailabilityPaging,
  UnavailabilityReasons
} from "@shared/models/reject-reason.model";
import { HttpErrorResponse } from "@angular/common/http";
import { ShowToast } from "../../store/app.actions";
import { MessageTypes } from "@shared/enums/message-types";
import { getAllErrors } from "@shared/utils/error.utils";
import { RECORD_ADDED, RECORD_DELETE, RECORD_MODIFIED } from "@shared/constants";
import { Penalty, PenaltyPage } from "@shared/models/penalty.model";
import { sortByField } from "@shared/helpers/sort-by-field.helper";
import { PageOfCollections } from '@shared/models/page.model';
import { GetSourcingConfigModel } from "@shared/models/organization.model";
import { CreateSystemString, prepareCancelReasonsPage } from '@organization-management/helpers';

export interface RejectReasonStateModel {
  rejectReasonsPage: RejectReasonPage | null;
  closureReasonsPage: RejectReasonPage | null;
  manualInvoicesReasonsPage: RejectReasonPage | null;
  orderRequisition: RejectReasonPage | null;
  penalties: PenaltyPage | null;
  isReasonLoading: boolean;
  unavailabilityReasons: PageOfCollections<UnavailabilityReasons> | null;
  cancelEmployeeReasons: PageOfCollections<CancelEmployeeReasons> | null;
  internalTransfer: RejectReasonPage | null;
  inactivationReasons: RejectReasonPage | null;
  souringReason: any | null;
  categoryNote: RejectReasonPage | null;
  recuriterReasonsPage: RecuriterReasonPage | null;
  sourcingReasonsPage: SourcingReasonPage | null;
  souringConfig: GetSourcingConfigModel | null;
}

@State<RejectReasonStateModel>({
  name: 'rejectReason',
  defaults: {
    rejectReasonsPage: null,
    closureReasonsPage: null,
    manualInvoicesReasonsPage: null,
    orderRequisition: null,
    penalties: null,
    isReasonLoading: false,
    unavailabilityReasons: null,
    cancelEmployeeReasons: null,
    internalTransfer: null,
    inactivationReasons: null,
    categoryNote: null,
    souringReason:  null,
    recuriterReasonsPage:null,
    sourcingReasonsPage:null,
    souringConfig:null
  },
})
@Injectable()
export class RejectReasonState {
  @Selector()
  static rejectReasonsPage(state: RejectReasonStateModel): RejectReasonPage | null {
    return state.rejectReasonsPage;
  }

  @Selector()
  static closureReasonsPage(state: RejectReasonStateModel): RejectReasonPage | null {
    return state.closureReasonsPage;
  }

  @Selector()
  static manualInvoiceReasonsPage(state: RejectReasonStateModel): RejectReasonPage | null {
    return state.manualInvoicesReasonsPage;
  }

  @Selector()
  static orderRequisition(state: RejectReasonStateModel): RejectReasonPage | null {
    return state.orderRequisition;
  }


  @Selector()
  static sortedOrderRequisition(state: RejectReasonStateModel): RejectReasonPage | null {
    return { ...state.orderRequisition, items: sortByField(state.orderRequisition?.items ?? [], 'reason') } as RejectReasonPage;
  }


  @Selector()
  static penalties(state: RejectReasonStateModel): PenaltyPage | null {
    return state.penalties;
  }

  @Selector()
  static getUnavailabilityReasons(state: RejectReasonStateModel): PageOfCollections<UnavailabilityReasons> | null {
    return state.unavailabilityReasons;
  }

  @Selector()
  static getCancelEmployeeReasons(state: RejectReasonStateModel): PageOfCollections<CancelEmployeeReasons> | null {
    return state.cancelEmployeeReasons;
  }

  @Selector()
  static internalTransfer(state: RejectReasonStateModel) : RejectReasonPage | null {
    return state.internalTransfer;
  }

  @Selector()
  static inactivationReasons(state: RejectReasonStateModel) : RejectReasonPage | null {
    return state.inactivationReasons;
  }

  @Selector()
  static sourcingReasons(state: RejectReasonStateModel) : any | null {
    return state.souringReason;
  }


  @Selector()
  static categoryNote(state: RejectReasonStateModel) : RejectReasonPage | null {
    return state.categoryNote;
  }

  @Selector()
  static recuriterReasons(state: RejectReasonStateModel) : RecuriterReasonPage | null {
    return state.recuriterReasonsPage;
  }

  @Selector()
  static sourcingReasonspage(state: RejectReasonStateModel) : SourcingReasonPage | null {
    return state.sourcingReasonsPage;
  }
  @Selector()
  static sourcingConfigs(state: RejectReasonStateModel) : GetSourcingConfigModel | null {
    return state.souringConfig;
  }

  constructor(private rejectReasonService:RejectReasonService) {}

  @Action(GetRejectReasonsByPage)
  GetRejectReasonsByPage(
    { patchState }: StateContext<RejectReasonStateModel>,
    { pageNumber, pageSize }: GetRejectReasonsByPage
  ): Observable<RejectReasonPage> {
    patchState({ isReasonLoading: true });

    return this.rejectReasonService.getRejectReasonsByPage(pageNumber, pageSize).pipe(
      map((payload) => {
        return prepareCancelReasonsPage(payload);
      }),
      tap((payload) => {
        patchState({rejectReasonsPage: payload});
        return payload;
      })
    );
  }

  @Action(SaveRejectReasons)
  SaveRejectReasons(
    { patchState, getState, dispatch}: StateContext<RejectReasonStateModel>,
    { payload }: SaveRejectReasons
  ): Observable<RejectReason | void> {
    const state = getState();

    return this.rejectReasonService.saveRejectReasons(payload).pipe(
      tap(payload => {
        if(state.rejectReasonsPage){
          const reasonWithSystem = {
            ...payload,
            system: CreateSystemString(payload.includeInIRP as boolean, payload.includeInVMS as boolean)
          };

          const items = [reasonWithSystem, ...state.rejectReasonsPage?.items];
          const rejectReasonsPage = { ...state.rejectReasonsPage, items };
          patchState({rejectReasonsPage});
        }
        dispatch(new ShowToast(MessageTypes.Success, RECORD_ADDED));
        dispatch(new SaveRejectReasonsSuccess());

        return payload;
      }),
      catchError((error: HttpErrorResponse) => {
        dispatch(new SaveRejectReasonsError());
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)));
      })
    );
  }

  @Action(RemoveRejectReasons)
  RemoveRejectReasons(
    { dispatch }: StateContext<RejectReasonStateModel>,
    { id }: RemoveRejectReasons
  ): Observable<void> {
    return this.rejectReasonService.removeRejectReason(id).pipe(
      tap(() => {
        dispatch(new UpdateRejectReasonsSuccess());
        dispatch(new ShowToast(MessageTypes.Success, RECORD_DELETE));
      })
    );
  }

  @Action(UpdateRejectReasons)
  UpdateRejectReasons(
    { dispatch }: StateContext<RejectReasonStateModel>,
    { payload }: UpdateRejectReasons
  ): Observable<void> {
    return this.rejectReasonService.updateRejectReason(payload).pipe(
      tap(() => {
        dispatch(new UpdateRejectReasonsSuccess());
        dispatch(new SaveRejectReasonsSuccess());
        dispatch(new ShowToast(MessageTypes.Success, RECORD_MODIFIED));
      }),
      catchError((error: HttpErrorResponse) => {
        dispatch(new SaveRejectReasonsError());
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)));
      })
    );
  }

  @Action(RemoveClosureReasons)
  RemoveClosureReasons(
    { dispatch }: StateContext<RejectReasonStateModel>,
    { id }: RemoveClosureReasons
  ): Observable<void> {
    return this.rejectReasonService.removeClosureReason(id).pipe(
      tap(() => {
        dispatch(new UpdateClosureReasonsSuccess());
        dispatch(new ShowToast(MessageTypes.Success, RECORD_DELETE));
      }),
      catchError((error: HttpErrorResponse) => {
        dispatch(new SaveRejectReasonsError());
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)));
      })
    );
  }

  @Action(GetClosureReasonsByPage)
  GetClosureReasonsByPage(
    { patchState }: StateContext<RejectReasonStateModel>,
    { pageNumber, pageSize, orderBy, getAll, excludeDefaultReasons }: GetClosureReasonsByPage
  ): Observable<RejectReasonPage> {
    patchState({ isReasonLoading: true });
    return this.rejectReasonService.getClosureReasonsByPage(
      pageNumber,
      pageSize,
      orderBy,
      getAll,
      excludeDefaultReasons,
    ).pipe(
      tap((payload) => {
        patchState({closureReasonsPage: payload});
        return payload;
      })
    );
  }

  @Action(SaveClosureReasons)
  SaveClosureReasons(
    { dispatch}: StateContext<RejectReasonStateModel>,
    { payload }: SaveClosureReasons
  ): Observable<RejectReasonwithSystem | void> {
    return this.rejectReasonService.saveClosureReasons(payload).pipe(
      tap(payload => {
        dispatch(new ShowToast(MessageTypes.Success, RECORD_ADDED));
        dispatch(new UpdateClosureReasonsSuccess());
        return payload;
      }),
      catchError((error: HttpErrorResponse) => {
        dispatch(new SaveClosureReasonsError());
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)));
      })
    );
  }

  @Action(UpdateManualInvoiceRejectReason)
  UpdateManualInvoiceReason(
    { dispatch }: StateContext<RejectReasonStateModel>,
    { payload }: UpdateManualInvoiceRejectReason
  ): Observable<void> {
    return this.rejectReasonService.updateManualInvoiceReason(payload).pipe(
      tap(() => dispatch([
          new UpdateManualInvoiceRejectReasonSuccess(),
          new ShowToast(MessageTypes.Success, RECORD_MODIFIED),
        ])
      ),
      catchError((error: HttpErrorResponse) => {
        dispatch(new SaveManualInvoiceRejectReasonError());
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)));
      })
    );
  }

  @Action(RemoveManualInvoiceRejectReason)
  RemoveManualInvoiceReason(
    { dispatch }: StateContext<RejectReasonStateModel>,
    { id }: RemoveManualInvoiceRejectReason
  ): Observable<void> {
    return this.rejectReasonService.removeManualInvoiceReason(id).pipe(
      tap(() => dispatch([
          new UpdateManualInvoiceRejectReasonSuccess(),
          new ShowToast(MessageTypes.Success, RECORD_DELETE),
        ])
      ),
      catchError((error: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)));
      })
    );
  }

  @Action(GetManualInvoiceRejectReasonsByPage)
  GetManualInvoiceReasonsByPage(
    { patchState }: StateContext<RejectReasonStateModel>,
    { pageNumber, pageSize, orderBy, getAll }: GetManualInvoiceRejectReasonsByPage
  ): Observable<RejectReasonPage> {
    patchState({ isReasonLoading: true });

    return this.rejectReasonService.getManualInvoiceReasonsByPage(pageNumber, pageSize, orderBy, getAll).pipe(
      tap((payload) => {
        patchState({manualInvoicesReasonsPage: payload});
        return payload;
      })
    );
  }

  @Action(CreateManualInvoiceRejectReason)
  SaveManualInvoiceReason(
    { dispatch}: StateContext<RejectReasonStateModel>,
    { payload }: CreateManualInvoiceRejectReason
  ): Observable<RejectReason | void> {
    const request: Observable<RejectReason | void> = payload.id ?
      this.rejectReasonService.updateManualInvoiceReason(payload) :
      this.rejectReasonService.saveManualInvoiceReason(payload);

    return request.pipe(
      tap((payload) => {
        dispatch([
          new ShowToast(MessageTypes.Success, RECORD_ADDED),
          new UpdateManualInvoiceRejectReasonSuccess(),
        ]);

        return payload;
      }),
      catchError((error: HttpErrorResponse) => {
        dispatch(new SaveManualInvoiceRejectReasonError());
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)));
      })
    );
  }

  @Action(RemoveOrderRequisition)
  RemoveOrderRequisition(
    { dispatch }: StateContext<RejectReasonStateModel>,
    { id }: RemoveOrderRequisition
  ): Observable<void> {
    return this.rejectReasonService.removeOrderRequisition(id).pipe(
      tap(() => {
        dispatch(new UpdateOrderRequisitionSuccess());
        dispatch(new ShowToast(MessageTypes.Success, RECORD_DELETE));
      }),
      catchError((error: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)));
      })
    );
  }

  @Action(GetOrderRequisitionByPage)
  GetOrderRequisitionByPage(
    { patchState }: StateContext<RejectReasonStateModel>,
    { pageNumber, pageSize, orderBy, lastSelectedBusinessUnitId, excludeOpenPositionReason }: GetOrderRequisitionByPage
  ): Observable<RejectReasonPage> {
    patchState({ isReasonLoading: true });

    return this.rejectReasonService.getOrderRequisitionsByPage(
      pageNumber,
      pageSize,
      orderBy,
      lastSelectedBusinessUnitId,
      excludeOpenPositionReason,
    )
    .pipe(
      tap((payload) => {
        patchState({orderRequisition: payload});
        return payload;
      })
    );
  }

  @Action(SaveOrderRequisition)
  SaveOrderRequisition(
    { dispatch}: StateContext<RejectReasonStateModel>,
    { payload }: SaveOrderRequisition
  ): Observable<RejectReason | void> {
    return this.rejectReasonService.saveOrderRequisitions(payload).pipe(
      tap(payload => {
        dispatch(new ShowToast(MessageTypes.Success, RECORD_ADDED));
        dispatch(new UpdateOrderRequisitionSuccess());
        return payload;
      }),
      catchError((error: HttpErrorResponse) => {
        dispatch(new SaveOrderRequisitionError());
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)));
      })
    );
  }

  @Action(GetPenaltiesByPage)
  GetPenaltiesByPage(
    { patchState }: StateContext<RejectReasonStateModel>,
    { pageNumber, pageSize }: GetPenaltiesByPage
  ): Observable<PenaltyPage> {
    return this.rejectReasonService.getPenaltiesByPage(pageNumber, pageSize).pipe(
      tap((payload) => {
        patchState({penalties: payload});
        return payload;
      })
    );
  }

  @Action(SavePenalty)
  SavePenalty(
    { dispatch}: StateContext<RejectReasonStateModel>,
    { payload }: SavePenalty
  ): Observable<Penalty[] | void> {
    return this.rejectReasonService.savePenalty(payload).pipe(
      tap(data => {
        if (payload.candidateCancellationSettingId) {
          dispatch(new ShowToast(MessageTypes.Success, RECORD_MODIFIED));
        } else {
          dispatch(new ShowToast(MessageTypes.Success, RECORD_ADDED));
        }
        dispatch(new SavePenaltySuccess());

        return data;
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.error?.errors?.ForceUpsert) {
          return dispatch(new ShowOverridePenaltyDialog());
        } else {
          dispatch(new SavePenaltyError());
          return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)));
        }
      })
    );
  }

  @Action(RemovePenalty)
  RemovePenalty(
    { dispatch }: StateContext<RejectReasonStateModel>,
    { id }: RemovePenalty
  ): Observable<void> {
    return this.rejectReasonService.removePenalty(id).pipe(
      tap(() => {
        dispatch(new SavePenaltySuccess());
        dispatch(new ShowToast(MessageTypes.Success, RECORD_DELETE));
      }),
      catchError((error: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)));
      })
    );
  }

  @Action(GetCancelEmployeeReason)
  GetCancelEmployeeReason(
    { patchState }: StateContext<RejectReasonStateModel>,
    { page, pageSize, getAll, cancellationReasonType}: GetCancelEmployeeReason
  ): Observable<PageOfCollections<CancelEmployeeReasons>> {
    const payload: UnavailabilityPaging = {
      PageNumber: page,
      PageSize: pageSize,
      GetAll: getAll ?? false,
    };
    if (cancellationReasonType !== undefined) {
      payload.CancellationReasonType = cancellationReasonType;
    }
    return this.rejectReasonService.getCancelEmployeeReasons(payload).pipe(
      tap((response) => {
        patchState({
          cancelEmployeeReasons: response,
        });
      }),
    );
  }

  @Action(GetUnavailabilityReasons)
  GetUnavailabilityReasons(
    { patchState }: StateContext<RejectReasonStateModel>,
    { page, pageSize}: GetUnavailabilityReasons,
  ): Observable<PageOfCollections<UnavailabilityReasons>> {
    return this.rejectReasonService.getUnavailabilityReasons({
      PageNumber: page,
      PageSize: pageSize,
    })
    .pipe(
      tap((response) => {
        patchState({
          unavailabilityReasons: response,
        });
      }),
    );
  }

  @Action(SaveCancelEmployeeReason)
  SaveCancelEmployeeReason(
    { dispatch }: StateContext<RejectReasonStateModel>,
    { payload }: SaveCancelEmployeeReason
  ): Observable<void> {
    return this.rejectReasonService.saveCancelEmployeeReason(payload)
      .pipe(
        tap(() => {
          const message = payload?.id ? RECORD_MODIFIED : RECORD_ADDED;
          dispatch(new ShowToast(MessageTypes.Success, message));
        }),
        catchError((error: HttpErrorResponse) => {
          return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)));
        }),
      );
  }

  @Action(SaveUnavailabilityReason)
  SaveUnavailabilityReson(
    { dispatch }: StateContext<RejectReasonStateModel>,
    { payload }: SaveUnavailabilityReason,
  ): Observable<void> {
    return this.rejectReasonService.saveUnavailabilityReason(payload)
    .pipe(
      tap(() => {
        dispatch(new ShowToast(MessageTypes.Success, RECORD_ADDED));
      }),
      catchError((error: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)));
      }),
    );
  }

  @Action(RemoveCancelEmployeeReason)
  RemoveCancelEmployeeReason(
    { dispatch }: StateContext<RejectReasonStateModel>,
    { id }: RemoveCancelEmployeeReason
  ): Observable<void> {
    return this.rejectReasonService.removeCancelEmployeeReason(id)
      .pipe(
        tap(() => {
          dispatch(new ShowToast(MessageTypes.Success, RECORD_DELETE));
        }),
        catchError((error: HttpErrorResponse) => {
          return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)));
        }),
      );
  }

  @Action(RemoveUnavailabilityReason)
  DeleteUnavailabilityReason(
    { dispatch }: StateContext<RejectReasonStateModel>,
    { id }: RemoveUnavailabilityReason,
  ): Observable<void> {
    return this.rejectReasonService.removeUnavailabilityReason(id)
    .pipe(
      tap(() => {
        dispatch(new ShowToast(MessageTypes.Success, RECORD_DELETE));
      }),
      catchError((error: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)));
      }),
    );
  }

  @Action(GetInternalTransferReasons)
  GetInternalTransferReasons(
    { patchState }: StateContext<RejectReasonStateModel>,
    { pageNumber, pageSize }: GetInternalTransferReasons
  ): Observable<RejectReasonPage> {
    patchState({ isReasonLoading: true });

    return this.rejectReasonService.getInternalTransferReason(pageNumber, pageSize).pipe(
      tap((payload) => {
        patchState({internalTransfer: payload});
        return payload;
      })
    );
  }


  @Action(SaveInternalTransferReasons)
  SaveInternalTransferReasons(
    { dispatch}: StateContext<RejectReasonStateModel>,
    { payload }: SaveInternalTransferReasons
  ): Observable<RejectReason | void> {
    return this.rejectReasonService.saveInternalTransferReason(payload).pipe(
      tap(payload => {
        dispatch(new UpdateInternalTransferReasonsSuccess());
        dispatch(new ShowToast(MessageTypes.Success, RECORD_ADDED));
        return payload;
      }),
      catchError((error: HttpErrorResponse) => {
        dispatch(new UpdateInternalTransferReasonsError())
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)));
      })
    );
  }

  @Action(RemoveInternalTransferReasons)
  RemoveInternalTransferReasons(
    { dispatch }: StateContext<RejectReasonStateModel>,
    { id }: RemoveInternalTransferReasons
  ): Observable<void> {
    return this.rejectReasonService.removeInternalTransferReason(id).pipe(
      tap(() => {
        dispatch(new UpdateInternalTransferReasonsSuccess());
        dispatch(new ShowToast(MessageTypes.Success, RECORD_DELETE));
      }),
      catchError((error: HttpErrorResponse) => {
        dispatch(new UpdateInternalTransferReasonsError())
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)));
      })
    );  }

  @Action(UpdateInternalTransferReasons)
  UpdateInternalTransferReasons(
    { dispatch }: StateContext<RejectReasonStateModel>,
    { payload }: UpdateInternalTransferReasons
  ): Observable<void> {
    return this.rejectReasonService.updateInternalTransferReason(payload).pipe(
      tap(() => {
        dispatch(new UpdateInternalTransferReasonsSuccess());
        dispatch(new ShowToast(MessageTypes.Success, RECORD_MODIFIED));
      }),
      catchError((error: HttpErrorResponse) => {
        dispatch(new UpdateInternalTransferReasonsError())
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)));
      })
    );
  }

  @Action(GetInactivationReasons)
  GetInactivationReasons(
    { patchState }: StateContext<RejectReasonStateModel>,
    { pageNumber, pageSize }: GetInactivationReasons
  ): Observable<RejectReasonPage> {
    patchState({ isReasonLoading: true });

    return this.rejectReasonService.getInactivationReason(pageNumber, pageSize).pipe(
      tap((payload) => {
        patchState({inactivationReasons: payload});
        return payload;
      })
    );
  }

  @Action(GetSourcingReasons)
  GetSourcingReasons(
    { patchState }: StateContext<RejectReasonStateModel>,
    {}: GetInactivationReasons
  ): Observable<any> {
    patchState({ isReasonLoading: true });

    return this.rejectReasonService.GetSourcingReasons({}).pipe(
      tap((payload) => {
        patchState({souringReason: payload});
        return payload;
      })
    );
  }
  @Action(SaveInactivationReasons)
  SaveInactivationReasons(
    { dispatch}: StateContext<RejectReasonStateModel>,
    { payload }: SaveInactivationReasons
  ): Observable<RejectReason | void> {
    return this.rejectReasonService.saveInactivationReason(payload).pipe(
      tap(payload => {
        dispatch(new ShowToast(MessageTypes.Success, RECORD_ADDED));
        dispatch(new UpdateInactivationReasonsSuccess());
        return payload;
      }),
      catchError((error: HttpErrorResponse) => {
        dispatch(new SaveInactivatedReasonError());
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)));
      })
    );
  }

  @Action(RemoveInactivationReasons)
  RemoveInactivationReasons(
    { dispatch }: StateContext<RejectReasonStateModel>,
    { id }: RemoveInactivationReasons
  ): Observable<void> {
    return this.rejectReasonService.removeInactivationReason(id).pipe(
      tap(() => {
        dispatch(new UpdateInactivationReasonsSuccess());
        dispatch(new ShowToast(MessageTypes.Success, RECORD_DELETE));
      }),
      catchError((error: HttpErrorResponse) => {
        dispatch(new SaveInactivatedReasonError())
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)));
      })
    );  }

  @Action(UpdateInactivationReasons)
  UpdateInactivationReasons(
    { dispatch }: StateContext<RejectReasonStateModel>,
    { payload }: UpdateInactivationReasons
  ): Observable<void> {
    return this.rejectReasonService.updateInactivationReason(payload).pipe(
      tap(() => {
        dispatch(new UpdateInactivationReasonsSuccess());
        dispatch(new ShowToast(MessageTypes.Success, RECORD_MODIFIED));
      }),
      catchError((error: HttpErrorResponse) => {
        dispatch(new SaveInactivatedReasonError());
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)));
      })
    );
  }

  @Action(GetCategoryNoteReasons)
  GetCategoryNoteReasons(
    { patchState }: StateContext<RejectReasonStateModel>,
    { pageNumber, pageSize }: GetCategoryNoteReasons
  ): Observable<RejectReasonPage> {
    patchState({ isReasonLoading: true });

    return this.rejectReasonService.getCategoryNoteReason(pageNumber, pageSize).pipe(
      tap((payload) => {
        patchState({categoryNote: payload});
        return payload;
      })
    );
  }


  @Action(SaveCategoryNoteReasons)
  SaveCategoryNoteReasons(
    { dispatch}: StateContext<RejectReasonStateModel>,
    { payload }: SaveCategoryNoteReasons
  ): Observable<RejectReason | void> {
    return this.rejectReasonService.saveCategoryNoteReason(payload).pipe(
      tap(payload => {
        dispatch(new UpdateCategoryNoteReasonsSuccess());
        dispatch(new ShowToast(MessageTypes.Success, RECORD_ADDED));
        return payload;
      }),
      catchError((error: HttpErrorResponse) => {
        dispatch(new UpdateCategoryNoteReasonsError());
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)));
      })
    );
  }

  @Action(RemoveCategoryNoteReasons)
  RemoveCategoryNoteReasons(
    { dispatch }: StateContext<RejectReasonStateModel>,
    { id }: RemoveCategoryNoteReasons
  ): Observable<void> {
    return this.rejectReasonService.removeCategoryNoteReason(id).pipe(
      tap(() => {
        dispatch(new UpdateCategoryNoteReasonsSuccess());
        dispatch(new ShowToast(MessageTypes.Success, RECORD_DELETE));
      }),
      catchError((error: HttpErrorResponse) => {
        dispatch(new UpdateCategoryNoteReasonsError());
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)));
      })
    );  }

  @Action(UpdateCategoryNoteReasons)
  UpdateCategoryNoteReasons(
    { dispatch }: StateContext<RejectReasonStateModel>,
    { payload }: UpdateCategoryNoteReasons
  ): Observable<void> {
    return this.rejectReasonService.updateCategoryNoteReason(payload).pipe(
      tap(() => {
        dispatch(new UpdateCategoryNoteReasonsSuccess());
        dispatch(new ShowToast(MessageTypes.Success, RECORD_MODIFIED));
      }),
      catchError((error: HttpErrorResponse) => {
        dispatch(new UpdateCategoryNoteReasonsError());
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)));
      })
    );
  }


  //Recuriter-Reasons
  @Action(GetRecuriterReasonsByPage)
  GetRecuriterReasonsByPage(
    { patchState }: StateContext<RejectReasonStateModel>,
    { pageNumber, pageSize }: GetRecuriterReasonsByPage
  ): Observable<RecuriterReasonPage> {
    patchState({ isReasonLoading: true });

    return this.rejectReasonService.getRecuriterReasonsByPage(pageNumber, pageSize).pipe(
      tap((payload) => {
        patchState({recuriterReasonsPage: payload});
        return payload;
      })
    );
  }

  @Action(SaveRecuriterReasons)
  SaveRecuriterReasons(
    { patchState, getState, dispatch}: StateContext<RejectReasonStateModel>,
    { payload }: SaveRecuriterReasons
  ): Observable<RejectReason | void> {
    const state = getState();

    return this.rejectReasonService.saveRecuriterReasons(payload).pipe(
      tap(payload => {
        if(state.rejectReasonsPage){
          const items = [payload, ...state.rejectReasonsPage?.items];
          const rejectReasonsPage = { ...state.rejectReasonsPage, items };
          patchState({rejectReasonsPage});
        }
        dispatch(new ShowToast(MessageTypes.Success, RECORD_ADDED));
        dispatch(new UpdateRecuriterReasonsSuccess());

        return payload;
      }),
      catchError((error: HttpErrorResponse) => {
        dispatch(new SaveRecuriterReasonsError());
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)));
      })
    );
  }

  @Action(RemoveRecuriterReasons)
  RemoveRecuriterReasons(
    { dispatch }: StateContext<RejectReasonStateModel>,
    { id }: RemoveRecuriterReasons
  ): Observable<void> {
    return this.rejectReasonService.removeRecuriterReason(id).pipe(
      tap(() => {
        dispatch(new UpdateRecuriterReasonsSuccess());
        dispatch(new ShowToast(MessageTypes.Success, RECORD_DELETE));
      }),
      catchError((error: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)));
      })
    );
  }

  @Action(UpdateRecuriterReasons)
  UpdateRecuriterReasons(
    { dispatch }: StateContext<RejectReasonStateModel>,
    { payload }: UpdateRecuriterReasons
  ): Observable<void> {
    return this.rejectReasonService.updateRecuriterReason(payload).pipe(
      tap(() => {
        dispatch(new UpdateRecuriterReasonsSuccess());
        dispatch(new SaveRecuriterReasonsSuccess());
        dispatch(new ShowToast(MessageTypes.Success, RECORD_MODIFIED));
      }),
      catchError((error: HttpErrorResponse) => {
        dispatch(new SaveRecuriterReasonsError());
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)));
      })
    );
  }



  //Sourcing -reason
  @Action(GetSourcingReasonsByPage)
  GetSourcingReasonsByPage(
    { patchState }: StateContext<RejectReasonStateModel>,
    { pageNumber, pageSize }: GetSourcingReasonsByPage
  ): Observable<SourcingReasonPage> {
    patchState({ isReasonLoading: true });

    return this.rejectReasonService.getSourcingReasonsByPage(pageNumber, pageSize).pipe(
      tap((payload) => {
        patchState({sourcingReasonsPage: payload});
        return payload;
      })
    );
  }

  @Action(SaveSourcingReasons)
  SaveSourcingReasons(
    { patchState, getState, dispatch}: StateContext<RejectReasonStateModel>,
    { payload }: SaveSourcingReasons
  ): Observable<RejectReason | void> {
    const state = getState();

    return this.rejectReasonService.saveSourcingReasons(payload).pipe(
      tap(payload => {
        if(state.rejectReasonsPage){
          const items = [payload, ...state.rejectReasonsPage?.items];
          const rejectReasonsPage = { ...state.rejectReasonsPage, items };
          patchState({rejectReasonsPage});
        }
        dispatch(new ShowToast(MessageTypes.Success, RECORD_ADDED));
        dispatch(new UpdateSourcingReasonsSuccess());

        return payload;
      }),
      catchError((error: HttpErrorResponse) => {
        dispatch(new SaveSourcingReasonsError());
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)));
      })
    );
  }

  @Action(RemoveSourcingReasons)
  RemoveSourcingReasons(
    { dispatch }: StateContext<RejectReasonStateModel>,
    { id }: RemoveSourcingReasons
  ): Observable<void> {
    return this.rejectReasonService.removeSourcingReason(id).pipe(
      tap(() => {
        dispatch(new UpdateSourcingReasonsSuccess());
        dispatch(new ShowToast(MessageTypes.Success, RECORD_DELETE));
      }),catchError((error: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)));
      })
    );
  }

  @Action(UpdateSourcingReasons)
  UpdateSourcingReasons(
    { dispatch }: StateContext<RejectReasonStateModel>,
    { payload }: UpdateSourcingReasons
  ): Observable<void> {
    return this.rejectReasonService.updateSourcingReason(payload).pipe(
      tap(() => {
        dispatch(new UpdateSourcingReasonsSuccess());
        dispatch(new ShowToast(MessageTypes.Success, RECORD_MODIFIED));
      }),
      catchError((error: HttpErrorResponse) => {
        dispatch(new SaveSourcingReasonsError());
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)));
      })
    );
  }
  @Action(GetSourcingConfig)
  GetSourcingConfig(
    { patchState }: StateContext<RejectReasonStateModel>,
    {}: GetSourcingConfig
  ): Observable<GetSourcingConfigModel> {
    patchState({ isReasonLoading: true });

    return this.rejectReasonService.GetSourcingConfig({}).pipe(
      tap((payload) => {
        patchState({souringConfig: payload});
        return payload;
      })
    );
  }
}


