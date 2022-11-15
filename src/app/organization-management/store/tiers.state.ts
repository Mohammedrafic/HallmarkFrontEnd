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

@State<TiersStateModel>({
  name: 'tiers',
  defaults: {
    tiersByPage: null
  }
})
@Injectable()
export class TiersState {
  constructor(private tiersApiService: TiersApiService) {}

  @Selector()
  static tiersPage(state: TiersStateModel): TiersPage | null {
    return state.tiersByPage;
  }

  @Action(Tiers.GetTiersByPage)
  GetTiersByPage(
    { patchState }: StateContext<TiersStateModel>,
    { pageNumber, pageSize }: Tiers.GetTiersByPage
  ): Observable<TiersPage> {
    return this.tiersApiService.getTiersByPage(pageNumber,pageSize).pipe(
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
          new ShowSideDialog(false)
        ]);
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.error?.errors?.ForceUpsert) {
          return dispatch(new Tiers.ShowOverrideTierDialog());
        } else {
          return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)));
        }
      })
    )
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
    )
  }
}
