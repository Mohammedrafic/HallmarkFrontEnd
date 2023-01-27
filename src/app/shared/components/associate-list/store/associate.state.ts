import { Action, Selector, State, StateContext } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { TiersException } from '@shared/components/associate-list/store/associate.actions';
import { catchError, Observable, tap } from 'rxjs';
import { AssociateService } from '@shared/components/associate-list/services/associate.service';
import {
  AssociateOrganizationsAgency,
  AssociateOrganizationsAgencyPage,
  FeeExceptionsInitialData,
  FeeExceptionsPage,
  FeeSettings,
  JobDistributionInitialData,
  PartnershipSettings,
} from '@shared/models/associate-organizations.model';
import { ShowSideDialog, ShowToast } from '../../../../store/app.actions';
import { MessageTypes } from '@shared/enums/message-types';
import {
  RECORD_ADDED,
  RECORD_DELETE,
  RECORD_MODIFIED,
  RECORD_SAVED
} from '@shared/constants';
import { TierDTO } from '@shared/components/tiers-dialog/interfaces/tier-form.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { getAllErrors } from '@shared/utils/error.utils';
import { AssociateStateModel, TierExceptionPage, TierList } from '@shared/components/associate-list/interfaces';

@State<AssociateStateModel>({
  name: 'associateList',
  defaults: {
    associateListPage: {
      items: [],
    },
    feeSettings: null,
    feeExceptionsInitialData: null,
    jobDistributionInitialData: null,
    partnershipSettings: null,
    tierList: null,
    selectedOrganizationAgency: null,
    tiersExceptionByPage: null,
    associateAgencyOrg: [],
  },
})
@Injectable()
export class AssociateListState {
  constructor(private associateService: AssociateService) {}

  @Selector()
  static associateListPage(
    state: AssociateStateModel
  ): AssociateOrganizationsAgencyPage | { items: AssociateOrganizationsAgencyPage['items'] } {
    return state.associateListPage;
  }

  @Selector()
  static feeExceptionsInitialData(state: AssociateStateModel): FeeExceptionsInitialData | null {
    return state.feeExceptionsInitialData;
  }

  @Selector()
  static getSelectedOrganizationAgency(state: AssociateStateModel): AssociateOrganizationsAgency | null {
    return state.selectedOrganizationAgency;
  }

  @Selector()
  static getTiersExceptionPage(state: AssociateStateModel): TierExceptionPage | null {
    return state.tiersExceptionByPage;
  }

  @Selector()
  static getTiersList(state: AssociateStateModel): TierList[] | null {
    return state.tierList;
  }

  @Selector()
  static associateAgencyOrg(state: AssociateStateModel): { id: number, name: string }[] {
    return state.associateAgencyOrg;
  }

  @Selector()
  static partnershipSettings(state: AssociateStateModel): PartnershipSettings | null {
    return state.partnershipSettings;
  }

  @Selector()
  static feeExceptionsPage(state: AssociateStateModel): FeeExceptionsPage | undefined {
    return state.feeSettings?.feeExceptions;
  }

  @Selector()
  static jobDistributionInitialData(state: AssociateStateModel): JobDistributionInitialData | null {
    return state.jobDistributionInitialData;
  }

  @Selector()
  static baseFee(state: AssociateStateModel): number | null | undefined {
    return state.feeSettings?.baseFee;
  }

  @Action(TiersException.GetAssociateListPage)
  GetAssociateListPage(
    { patchState }: StateContext<AssociateStateModel>,
    { pageNumber, pageSize, orderBy }: TiersException.GetAssociateListPage
  ): Observable<AssociateOrganizationsAgencyPage> {
    return this.associateService.getAssociateListByPage(pageNumber, pageSize, orderBy).pipe(
      tap((payload) => {
        patchState({ associateListPage: payload });
        return payload;
      })
    );
  }

  @Action(TiersException.DeleteAssociateOrganizationsAgencyById)
  DeleteAssociateOrganizationsAgencyById(
    { dispatch, patchState, getState }: StateContext<AssociateStateModel>,
    { id }: TiersException.DeleteAssociateOrganizationsAgencyById
  ): Observable<never> {
    const state = getState();
    const associateListPage = {
      ...state.associateListPage,
      items: state.associateListPage?.items.filter((item: AssociateOrganizationsAgency) => item.id !== id),
    };

    return this.associateService.deleteAssociateOrganizationsAgencyById(id).pipe(
      tap(() => {
        patchState({ associateListPage });
        dispatch(new ShowToast(MessageTypes.Success, RECORD_DELETE));
      })
    );
  }

  @Action(TiersException.SaveFeeExceptions)
  SaveFeeExceptions(
    { dispatch, patchState, getState }: StateContext<AssociateStateModel>,
    { feeExceptionsDTO }: TiersException.SaveFeeExceptions
  ): Observable<FeeExceptionsPage> {
    const state = getState();
    const baseFee = state.feeSettings?.baseFee;
    return this.associateService.saveFeeExceptions(feeExceptionsDTO).pipe(
      tap((payload) => {
        const feeSettings: FeeSettings = {
          baseFee,
          feeExceptions: payload,
        };
        patchState({ feeSettings });
        dispatch(new TiersException.SaveFeeExceptionsSucceeded(payload));
        dispatch(new TiersException.UpdateAssociateOrganizationsAgencyPage());
        dispatch(new ShowToast(MessageTypes.Success, RECORD_ADDED));
        return payload;
      })
    );
  }

  @Action(TiersException.RemoveFeeExceptionsById)
  RemoveFeeExceptionsById(
    { patchState, getState, dispatch }: StateContext<AssociateStateModel>,
    { id }: TiersException.RemoveFeeExceptionsById
  ): Observable<never> {
    const state = getState();
    return this.associateService.removeFeeExceptionsById(id).pipe(
      tap(() => {
        const feeSettings = {
          feeExceptions: {
            ...state.feeSettings?.feeExceptions,
            items: state.feeSettings?.feeExceptions?.items.filter((item) => item.id !== id),
          },
          baseFee: state.feeSettings?.baseFee,
        } as FeeSettings;
        patchState({ feeSettings });
        dispatch(new TiersException.UpdateAssociateOrganizationsAgencyPage());
      })
    );
  }

  @Action(TiersException.SavePartnershipSettings)
  SavePartnershipSettings(
    { patchState, dispatch }: StateContext<AssociateStateModel>,
    { payload }: TiersException.SavePartnershipSettings
  ): Observable<PartnershipSettings> {
    return this.associateService.savePartnershipSettings(payload).pipe(
      tap((payload) => {
        patchState({ partnershipSettings: payload });
        dispatch(new TiersException.UpdateAssociateOrganizationsAgencyPage());
        dispatch(new ShowToast(MessageTypes.Success, RECORD_SAVED));
        return payload;
      })
    );
  }

  @Action(TiersException.SaveBaseFee)
  SaveBaseFee(
    { patchState, dispatch, getState }: StateContext<AssociateStateModel>,
    { associateOrganizationId, baseFee }: TiersException.SaveBaseFee
  ): Observable<FeeSettings> {
    const state = getState();
    return this.associateService.saveBaseFee(associateOrganizationId, baseFee).pipe(
      tap(({ baseFee }) => {
        const feeSettings = {
          feeExceptions: state.feeSettings?.feeExceptions,
          baseFee,
        };
        patchState({ feeSettings });
        dispatch(new TiersException.UpdateAssociateOrganizationsAgencyPage());
        dispatch(new ShowToast(MessageTypes.Success, RECORD_SAVED));
      })
    );
  }

  @Action(TiersException.GetFeeExceptionsInitialData)
  GetFeeExceptionsInitialData(
    { patchState }: StateContext<AssociateStateModel>,
    { organizationId }: TiersException.GetFeeExceptionsInitialData
  ): Observable<FeeExceptionsInitialData> {
    return this.associateService.getFeeExceptionsInitialData(organizationId).pipe(
      tap((payload) => {
        patchState({ feeExceptionsInitialData: payload });
      })
    );
  }

  @Action(TiersException.GetJobDistributionInitialData)
  GetJobDistributionInitialData({
    patchState,
  }: StateContext<AssociateStateModel>): Observable<JobDistributionInitialData> {
    return this.associateService.getJobDistributionInitialData().pipe(
      tap((payload) => {
        patchState({ jobDistributionInitialData: payload });
      })
    );
  }

  @Action(TiersException.GetPartnershipSettings)
  GetPartnershipSettings(
    { patchState }: StateContext<AssociateStateModel>,
    { organizationId }: TiersException.GetPartnershipSettings
  ): Observable<PartnershipSettings> {
    return this.associateService.getPartnershipSettingsById(organizationId).pipe(
      tap((payload) => {
        patchState({ partnershipSettings: payload });
        return payload;
      })
    );
  }

  @Action(TiersException.GetFeeSettingByOrganizationId)
  GetFeeSettingByOrganizationId(
    { patchState, dispatch }: StateContext<AssociateStateModel>,
    { organizationAgencyId, pageNumber, pageSize }: TiersException.GetFeeSettingByOrganizationId
  ): Observable<FeeSettings | void> {
    return this.associateService.getFeeSettingByOrganizationId(organizationAgencyId, pageNumber, pageSize).pipe(
      tap((payload) => {
        patchState({ feeSettings: payload });
        return payload;
      }),
      catchError((error: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)));
      })
    );
  }

  @Action(TiersException.GetAssociateAgencyOrg)
  GetAssociateAgencyOrg(
    { patchState, dispatch }: StateContext<AssociateStateModel>
  ): Observable<void | { id: number, name: string }[]> {
    return this.associateService.getAssociateAgencyOrg().pipe(
      tap((payload: { id: number, name: string }[]) => {
        patchState({ associateAgencyOrg: payload });
      }),
      catchError((error: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)));
      })
    );
  }

  @Action(TiersException.InviteOrganizationsAgency)
  InviteOrganizationsAgency(
    { patchState, dispatch, getState }: StateContext<AssociateStateModel>,
    { organizationIds }: TiersException.InviteOrganizationsAgency
  ): Observable<AssociateOrganizationsAgency[]> {
    const state = getState();

    return this.associateService.inviteOrganizationsAgency(organizationIds).pipe(
      tap((payload) => {
        const associateListPage = {
          ...state.associateListPage,
          items: [...state.associateListPage.items, ...payload],
        };

        patchState({ associateListPage });
        dispatch(new ShowToast(MessageTypes.Success, RECORD_SAVED));
        dispatch(new TiersException.InviteOrganizationsSucceeded(payload));
      })
    );
  }

  @Action(TiersException.GetTiers)
  GetTiers(
    { patchState, dispatch }: StateContext<AssociateStateModel>,
    { payload }: TiersException.GetTiers
  ): Observable<TierList[] | void> {
    return this.associateService.getTiers(payload).pipe(
      tap((tierList: TierList[]) => {
        patchState({tierList});
      }),
      catchError((error: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)));
      })
    );
  }

  @Action(TiersException.SaveTierException)
  SaveTier(
    { dispatch }: StateContext<AssociateStateModel>,
    { payload, isEdit }: TiersException.SaveTierException
  ): Observable<TierDTO | void> {
    return this.associateService.saveTierException(payload).pipe(
      tap(() => {
        dispatch([
          new ShowToast(MessageTypes.Success, isEdit ? RECORD_MODIFIED : RECORD_ADDED),
          new ShowSideDialog(false),
          new TiersException.UpdateExceptionAfterSuccessAction
        ]);
      }),
      catchError((error: HttpErrorResponse) => {
          return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)));
      })
    );
  }

  @Action(TiersException.GetTierExceptionByPage)
  GetTierExceptionByPage(
    { patchState, dispatch }: StateContext<AssociateStateModel>,
    { id, pageNumber, pageSize }: TiersException.GetTierExceptionByPage
  ): Observable<TierExceptionPage | void> {
    return this.associateService.getTiersByPage(id,pageNumber,pageSize).pipe(
      tap((tiersExceptionByPage: TierExceptionPage) => {
        patchState({ tiersExceptionByPage });
      }),
      catchError((error: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)));
      })
    )
  }

  @Action(TiersException.DeleteTierException)
  DeleteTierException(
    { dispatch }: StateContext<AssociateStateModel>,
    { id }: TiersException.DeleteTierException
  ): Observable<void> {
    return this.associateService.deleteTierException(id).pipe(
      tap(() => {
        dispatch([
          new ShowToast(MessageTypes.Success, RECORD_DELETE),
          new TiersException.UpdateExceptionAfterSuccessAction
        ])
      }),
      catchError((error: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)));
      })
    )
  }

  @Action(TiersException.GetSelectedOrgAgency)
  GetSelectedOrgAgency(
    { patchState }: StateContext<AssociateStateModel>,
    { selectedOrganizationAgency }: TiersException.GetSelectedOrgAgency
  ): void {
    patchState({ selectedOrganizationAgency })
  }

  @Action(TiersException.SaveTier)
  SaveSelectedTier(
    { dispatch }: StateContext<AssociateStateModel>,
    { payload }: TiersException.SaveTier
  ): Observable<void> {
    return this.associateService.saveSelectedTier(payload).pipe(
      tap(() => {
        dispatch(new ShowToast(MessageTypes.Success,  RECORD_ADDED));
        dispatch(new TiersException.UpdateAssociateOrganizationsAgencyPage());
      }),
      catchError((error: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)));
      })
    )
  }
}

