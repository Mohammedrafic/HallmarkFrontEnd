import { Action, Selector, State, StateContext } from '@ngxs/store';
import { Injectable } from '@angular/core';
import {
  DeleteAssociateOrganizationsAgencyById,
  GetAssociateAgencyOrg,
  GetAssociateListPage,
  GetFeeExceptionsInitialData,
  GetFeeSettingByOrganizationId,
  GetJobDistributionInitialData,
  GetPartnershipSettings,
  InviteOrganizationsAgency,
  InviteOrganizationsSucceeded,
  RemoveFeeExceptionsById,
  SaveBaseFee,
  SaveFeeExceptions,
  SaveFeeExceptionsSucceeded,
  SavePartnershipSettings,
  UpdateAssociateOrganizationsAgencyPage,
} from '@shared/components/associate-list/store/associate.actions';
import { Observable, tap } from 'rxjs';
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
import { ShowToast } from '../../../../store/app.actions';
import { MessageTypes } from '@shared/enums/message-types';
import { RECORD_ADDED, RECORD_DELETE, RECORD_SAVED } from '@shared/constants';

export interface AssociateStateModel {
  associateListPage: AssociateOrganizationsAgencyPage | { items: AssociateOrganizationsAgencyPage['items'] };
  feeSettings: FeeSettings | null;
  feeExceptionsInitialData: FeeExceptionsInitialData | null;
  partnershipSettings: PartnershipSettings | null;
  jobDistributionInitialData: JobDistributionInitialData | null;
  associateAgencyOrg: string | null;
}
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
    associateAgencyOrg: null,
  },
})
@Injectable()
export class AssociateListState {
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
  static associateAgencyOrg(state: AssociateStateModel): string | null {
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

  constructor(private associateService: AssociateService) {}

  @Action(GetAssociateListPage)
  GetAssociateListPage(
    { patchState }: StateContext<AssociateStateModel>,
    { pageNumber, pageSize }: GetAssociateListPage
  ): Observable<AssociateOrganizationsAgencyPage> {
    return this.associateService.getAssociateListByPage(pageNumber, pageSize).pipe(
      tap((payload) => {
        patchState({ associateListPage: payload });
        return payload;
      })
    );
  }

  @Action(DeleteAssociateOrganizationsAgencyById)
  DeleteAssociateOrganizationsAgencyById(
    { dispatch, patchState, getState }: StateContext<AssociateStateModel>,
    { id }: DeleteAssociateOrganizationsAgencyById
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

  @Action(SaveFeeExceptions)
  SaveFeeExceptions(
    { dispatch, patchState, getState }: StateContext<AssociateStateModel>,
    { feeExceptionsDTO }: SaveFeeExceptions
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
        dispatch(new SaveFeeExceptionsSucceeded(payload));
        dispatch(new UpdateAssociateOrganizationsAgencyPage());
        dispatch(new ShowToast(MessageTypes.Success, RECORD_ADDED));
        return payload;
      })
    );
  }

  @Action(RemoveFeeExceptionsById)
  RemoveFeeExceptionsById(
    { patchState, getState, dispatch }: StateContext<AssociateStateModel>,
    { id }: RemoveFeeExceptionsById
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
        dispatch(new UpdateAssociateOrganizationsAgencyPage());
      })
    );
  }

  @Action(SavePartnershipSettings)
  SavePartnershipSettings(
    { patchState, dispatch }: StateContext<AssociateStateModel>,
    { payload }: SavePartnershipSettings
  ): Observable<PartnershipSettings> {
    return this.associateService.savePartnershipSettings(payload).pipe(
      tap((payload) => {
        patchState({ partnershipSettings: payload });
        dispatch(new UpdateAssociateOrganizationsAgencyPage());
        dispatch(new ShowToast(MessageTypes.Success, RECORD_SAVED));
        return payload;
      })
    );
  }

  @Action(SaveBaseFee)
  SaveBaseFee(
    { patchState, dispatch, getState }: StateContext<AssociateStateModel>,
    { associateOrganizationId, baseFee }: SaveBaseFee
  ): Observable<FeeSettings> {
    const state = getState();
    return this.associateService.saveBaseFee(associateOrganizationId, baseFee).pipe(
      tap(({ baseFee }) => {
        const feeSettings = {
          feeExceptions: state.feeSettings?.feeExceptions,
          baseFee,
        };
        patchState({ feeSettings });
        dispatch(new UpdateAssociateOrganizationsAgencyPage());
        dispatch(new ShowToast(MessageTypes.Success, RECORD_SAVED));
      })
    );
  }

  @Action(GetFeeExceptionsInitialData)
  GetFeeExceptionsInitialData(
    { patchState }: StateContext<AssociateStateModel>,
    { organizationId }: GetFeeExceptionsInitialData
  ): Observable<FeeExceptionsInitialData> {
    return this.associateService.getFeeExceptionsInitialData(organizationId).pipe(
      tap((payload) => {
        patchState({ feeExceptionsInitialData: payload });
      })
    );
  }

  @Action(GetJobDistributionInitialData)
  GetJobDistributionInitialData({
    patchState,
  }: StateContext<AssociateStateModel>): Observable<JobDistributionInitialData> {
    return this.associateService.getJobDistributionInitialData().pipe(
      tap((payload) => {
        patchState({ jobDistributionInitialData: payload });
      })
    );
  }

  @Action(GetPartnershipSettings)
  GetPartnershipSettings(
    { patchState }: StateContext<AssociateStateModel>,
    { organizationId }: GetPartnershipSettings
  ): Observable<PartnershipSettings> {
    return this.associateService.getPartnershipSettingsById(organizationId).pipe(
      tap((payload) => {
        patchState({ partnershipSettings: payload });
        return payload;
      })
    );
  }

  @Action(GetFeeSettingByOrganizationId)
  GetFeeSettingByOrganizationId(
    { patchState, dispatch }: StateContext<AssociateStateModel>,
    { organizationAgencyId, pageNumber, pageSize }: GetFeeSettingByOrganizationId
  ): Observable<FeeSettings> {
    return this.associateService.getFeeSettingByOrganizationId(organizationAgencyId, pageNumber, pageSize).pipe(
      tap((payload) => {
        patchState({ feeSettings: payload });
        return payload;
      })
    );
  }

  @Action(GetAssociateAgencyOrg)
  GetAssociateAgencyOrg({ patchState }: StateContext<AssociateStateModel>): Observable<string> {
    return this.associateService.getAssociateAgencyOrg().pipe(
      tap((payload: string) => {
        patchState({ associateAgencyOrg: payload });
      })
    );
  }

  @Action(InviteOrganizationsAgency)
  InviteOrganizationsAgency(
    { patchState, dispatch, getState }: StateContext<AssociateStateModel>,
    { organizationIds }: InviteOrganizationsAgency
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
        dispatch(new InviteOrganizationsSucceeded(payload));
      })
    );
  }
}
