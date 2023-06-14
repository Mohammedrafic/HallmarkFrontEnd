import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { Action, Selector, State, StateContext } from '@ngxs/store';
import { catchError, Observable, tap } from 'rxjs';

import { TiersApiService } from '@shared/services';
import { Tiers } from '@organization-management/store/tiers.actions';
import { ShowSideDialog, ShowToast } from '../../store/app.actions';
import { MessageTypes } from '@shared/enums/message-types';
import { RECORD_ADDED, RECORD_DELETE, RECORD_MODIFIED } from '@shared/constants';
import { getAllErrors } from '@shared/utils/error.utils';
import { TierDTO } from '@shared/components/tiers-dialog/interfaces/tier-form.interface';
import { TiersPage } from '@shared/components/tiers-dialog/interfaces';
import { TiersStateModel } from '@organization-management/interfaces';
import { CommitmentStateModel } from '@admin/store/commitment.state';
import { MasterCommitmentsPage } from '@shared/models/commitment.model';

@State<TiersStateModel>({
  name: 'tiers',
  defaults: {
    tiersByPage: null,
    isCommitmentLoading : false,
    commitmentsPage : null
  }
})
@Injectable()
export class TiersState {
  constructor(private tiersApiService: TiersApiService) {}

  @Selector()
  static tiersPage(state: TiersStateModel): TiersPage | null {
    return state.tiersByPage;
  }
  @Selector()
  static workCommitmentsPageforTier(state: CommitmentStateModel): MasterCommitmentsPage | null {
    return state.commitmentsPage;
  }

  @Action(Tiers.GetTiersByPage)
  GetTiersByPage(
    { patchState }: StateContext<TiersStateModel>,
    { pageNumber, pageSize, systemType }: Tiers.GetTiersByPage
  ): Observable<TiersPage> {
    return this.tiersApiService.getTiersByPage(pageNumber, pageSize, systemType).pipe(
      tap((tiersByPage: TiersPage) => {
        patchState({ tiersByPage });
      })
    );
  }

  @Action(Tiers.SaveTier)
  SaveTier(
    { dispatch }: StateContext<TiersStateModel>,
    { payload, isEdit }: Tiers.SaveTier
  ): Observable<TierDTO | void> {
    return this.tiersApiService.saveTier(payload).pipe(
      tap(() => {
        dispatch([
          new ShowToast(MessageTypes.Success, isEdit ? RECORD_MODIFIED : RECORD_ADDED),
          new ShowSideDialog(false),
          new Tiers.UpdatePageAfterSuccessAction()
        ]);
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.error?.errors?.ForceUpsert) {
          return dispatch(new Tiers.ShowOverrideTierDialog());
        } else {
          return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)));
        }
      })
    );
  }

  @Action(Tiers.SaveTierIRP)
  SaveTierIRP(
    { dispatch }: StateContext<TiersStateModel>,
    { payload, isEdit }: Tiers.SaveTierIRP
  ): Observable<TierDTO | void> {
    return this.tiersApiService.saveTierIRP(payload).pipe(
      tap(() => {
        dispatch([
          new ShowToast(MessageTypes.Success, isEdit ? RECORD_MODIFIED : RECORD_ADDED),
          new ShowSideDialog(false),
          new Tiers.UpdatePageAfterSuccessAction()
        ]);
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.error?.errors?.ForceUpsert) {
          return dispatch(new Tiers.ShowOverrideTierDialog());
        } else {
          return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)));
        }
      })
    );
  }

  @Action(Tiers.DeleteTier)
  DeleteTier(
    { dispatch }: StateContext<TiersStateModel>,
    { id }: Tiers.DeleteTier
  ): Observable<void> {
    return this.tiersApiService.deleteTier(id).pipe(
      tap(() => {
        dispatch([
          new ShowToast(MessageTypes.Success, RECORD_DELETE),
          new Tiers.UpdatePageAfterSuccessAction()
        ]);
      }),
      catchError((error: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)));
      })
    );
  }

  @Action(Tiers.ChangeTierPriority)
  ChangeTierPriority(
    { patchState, dispatch }: StateContext<TiersStateModel>,
    { payload }: Tiers.ChangeTierPriority
  ): Observable<TiersPage | void> {
    return this.tiersApiService.updateTierPriority(payload).pipe(
      tap((tiersByPage: TiersPage) => {
        patchState({ tiersByPage });
        dispatch(new ShowToast(MessageTypes.Success, RECORD_MODIFIED))
      }),
      catchError((error: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)));
      })
    );
  }

  @Action(Tiers.GetWorkCommitmentByPageforTiers)
  GetWorkCommitmentByPageforTiers(
    { patchState }: StateContext<TiersStateModel>,
    ): Observable<TiersPage> {

    return this.tiersApiService.getMasterWorkCommitments().pipe(
      tap((payload : any) => {
        patchState({commitmentsPage: payload, isCommitmentLoading: false});
        return payload;
      })
    );
  }
}
