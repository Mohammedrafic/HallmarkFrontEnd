import { Action, Selector, State, StateContext } from "@ngxs/store";
import { Injectable } from "@angular/core";
import { RejectReasonService } from "@shared/services/reject-reason.service";
/**
 * TODO: use es6 modules.
 */
import {
  GetClosureReasonsByPage, GetManualInvoiceRejectReasonsByPage,
  GetRejectReasonsByPage,
  RemoveClosureReasons, RemoveManualInvoiceRejectReason,
  RemoveRejectReasons,
  SaveClosureReasons,
  SaveClosureReasonsError, CreateManualInvoiceRejectReason, SaveManualInvoiceRejectReasonError,
  SaveRejectReasons, SaveRejectReasonsError, SaveRejectReasonsSuccess,
  UpdateClosureReasonsSuccess, UpdateManualInvoiceRejectReason, UpdateManualInvoiceRejectReasonSuccess,
  UpdateRejectReasons, UpdateRejectReasonsSuccess, RemoveOrderRequisition, UpdateOrderRequisitionSuccess,
  GetOrderRequisitionByPage, SaveOrderRequisition, SaveOrderRequisitionError, GetPenaltiesByPage, SavePenalty,
  SavePenaltySuccess, SavePenaltyError, RemovePenalty, ShowOverridePenaltyDialog, GetUnavailabilityReasons,
  SaveUnavailabilityReason, RemoveUnavailabilityReason,GetInternalTransferReasons, SaveInternalTransferReasons, RemoveInternalTransferReasons, UpdateInternalTransferReasons, UpdateInternalTransferReasonsSuccess, GetTerminationReasons, SaveTerminationReasons, RemoveTerminationReasons, UpdateTerminationReasons, UpdateTerminationReasonsSuccess, GetCategoryNoteReasons, SaveCategoryNoteReasons, RemoveCategoryNoteReasons, UpdateCategoryNoteReasons, UpdateCategoryNoteReasonsSuccess, SaveTerminatedReasonError, UpdateInternalTransferReasonsError, UpdateCategoryNoteReasonsError,
} from "@organization-management/store/reject-reason.actions";
import { catchError, Observable, tap } from "rxjs";
import { RejectReason, RejectReasonPage, RejectReasonwithSystem, UnavailabilityReasons } from "@shared/models/reject-reason.model";
import { HttpErrorResponse } from "@angular/common/http";
import { ShowToast } from "../../store/app.actions";
import { MessageTypes } from "@shared/enums/message-types";
import { getAllErrors } from "@shared/utils/error.utils";
import { RECORD_ADDED, RECORD_DELETE, RECORD_MODIFIED } from "@shared/constants";
import { Penalty, PenaltyPage } from "@shared/models/penalty.model";
import { sortByField } from "@shared/helpers/sort-by-field.helper";
import { PageOfCollections } from '@shared/models/page.model';

export interface RejectReasonStateModel {
  rejectReasonsPage: RejectReasonPage | null;
  closureReasonsPage: RejectReasonPage | null;
  manualInvoicesReasonsPage: RejectReasonPage | null;
  orderRequisition: RejectReasonPage | null;
  penalties: PenaltyPage | null;
  isReasonLoading: boolean;
  unavailabilityReasons: PageOfCollections<UnavailabilityReasons> | null;
  internalTransfer: RejectReasonPage | null;
  terminationReasons: RejectReasonPage | null;
  categoryNote: RejectReasonPage | null;
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
    internalTransfer: null,
    terminationReasons: null,
    categoryNote: null
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
  static internalTransfer(state: RejectReasonStateModel) : RejectReasonPage | null {
    return state.internalTransfer;
  }

  @Selector()
  static terminationReasons(state: RejectReasonStateModel) : RejectReasonPage | null {
    return state.terminationReasons;
  }

  @Selector()
  static categoryNote(state: RejectReasonStateModel) : RejectReasonPage | null {
    return state.categoryNote;
  }


  constructor(private rejectReasonService:RejectReasonService) {}

  @Action(GetRejectReasonsByPage)
  GetRejectReasonsByPage(
    { patchState }: StateContext<RejectReasonStateModel>,
    { pageNumber, pageSize }: GetRejectReasonsByPage
  ): Observable<RejectReasonPage> {
    patchState({ isReasonLoading: true });

    return this.rejectReasonService.getRejectReasonsByPage(pageNumber, pageSize).pipe(
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
          const items = [payload, ...state.rejectReasonsPage?.items];
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
      })
    );
  }

  @Action(GetClosureReasonsByPage)
  GetClosureReasonsByPage(
    { patchState }: StateContext<RejectReasonStateModel>,
    { pageNumber, pageSize, orderBy, getAll }: GetClosureReasonsByPage
  ): Observable<RejectReasonPage> {
    patchState({ isReasonLoading: true });

    return this.rejectReasonService.getClosureReasonsByPage(pageNumber, pageSize, orderBy, getAll).pipe(
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
      })
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

  @Action(GetTerminationReasons)
  GetTerminationReasons(
    { patchState }: StateContext<RejectReasonStateModel>,
    { pageNumber, pageSize }: GetTerminationReasons
  ): Observable<RejectReasonPage> {
    patchState({ isReasonLoading: true });

    return this.rejectReasonService.getTerminationReason(pageNumber, pageSize).pipe(
      tap((payload) => {
        patchState({terminationReasons: payload});
        return payload;
      })
    );
  }


  @Action(SaveTerminationReasons)
  SaveTerminationReasons(
    { dispatch}: StateContext<RejectReasonStateModel>,
    { payload }: SaveTerminationReasons
  ): Observable<RejectReason | void> {
    return this.rejectReasonService.saveTerminationReason(payload).pipe(
      tap(payload => {
        dispatch(new ShowToast(MessageTypes.Success, RECORD_ADDED));
        dispatch(new UpdateTerminationReasonsSuccess());
        return payload;
      }),
      catchError((error: HttpErrorResponse) => {
        dispatch(new SaveTerminatedReasonError());
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)));
      })
    );
  }

  @Action(RemoveTerminationReasons)
  RemoveTerminationReasons(
    { dispatch }: StateContext<RejectReasonStateModel>,
    { id }: RemoveTerminationReasons
  ): Observable<void> {
    return this.rejectReasonService.removeTerminationReason(id).pipe(
      tap(() => {
        dispatch(new UpdateTerminationReasonsSuccess());
        dispatch(new ShowToast(MessageTypes.Success, RECORD_DELETE));
      }),
      catchError((error: HttpErrorResponse) => {
        dispatch(new SaveTerminatedReasonError())
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)));
      })
    );  }

  @Action(UpdateTerminationReasons)
  UpdateTerminationReasons(
    { dispatch }: StateContext<RejectReasonStateModel>,
    { payload }: UpdateTerminationReasons
  ): Observable<void> {
    return this.rejectReasonService.updateTerminationReason(payload).pipe(
      tap(() => {
        dispatch(new UpdateTerminationReasonsSuccess());
        dispatch(new ShowToast(MessageTypes.Success, RECORD_MODIFIED));
      }),
      catchError((error: HttpErrorResponse) => {
        dispatch(new SaveTerminatedReasonError());
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

}

