import { FeeExceptionsService } from '@agency/services/fee-exceptions.service';
import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { Observable, of, tap } from 'rxjs';
import { RECORD_ADDED, RECORD_MODIFIED, RECORD_SAVED } from 'src/app/shared/constants/messages';
import { MessageTypes } from 'src/app/shared/enums/message-types';

import { Agency, AgencyPage } from 'src/app/shared/models/agency.model';
import {
  AssociateOrganizations,
  AssociateOrganizationsPage,
  FeeExceptionsInitialData,
  FeeExceptionsPage,
  FeeSettings,
  JobDistribution,
  JobDistributionInitialData,
} from 'src/app/shared/models/associate-organizations.model';
import { Organization, OrganizationPage } from 'src/app/shared/models/organization.model';
import { OrganizationService } from 'src/app/shared/services/organization.service';
import { ShowToast } from 'src/app/store/app.actions';
import { AgencyService } from '../services/agency.service';
import { AssociateOrganizationsService } from '../services/associate-organizations.service';
import {
  GetAssociateOrganizationsById,
  GetOrganizationsByPage,
  InvateOrganizations,
  InvateOrganizationsSucceeded,
  SaveAgency,
  SaveAgencySucceeded,
  GetAgencyById,
  GetAgencyByIdSucceeded,
  GetAgencyByPage,
  GetFeeSettingByOrganizationId,
  GetFeeSettingByOrganizationIdSucceeded,
  GetAgencyLogo,
  GetAgencyLogoSucceeded,
  UploadAgencyLogo,
  ClearAgencyEditStore,
  DeleteAssociateOrganizationsById,
  DeleteAssociateOrganizationsByIdSucceeded,
  GetFeeExceptionsInitialData,
  GetJobDistributionInitialData,
  SaveJobDistribution,
  SaveJobDistributionSucceeded,
  GetJobDistributionId,
  SaveFeeExceptions,
  SaveFeeExceptionsSucceeded,
  SaveBaseFee,
  RemoveFeeExceptionsById,
} from './agency.actions';

export interface AgencyStateModel {
  isAgencyLoading: boolean;
  agency: Agency | null;
  isOrganizationLoading: boolean;
  organizations: OrganizationPage | null;
  associateOrganizationsPages: AssociateOrganizationsPage | { items: AssociateOrganizationsPage['items'] };
  agencyPage: AgencyPage | null;
  feeSettings: FeeSettings | null;
  feeExceptionsInitialData: FeeExceptionsInitialData | null;
  jobDistributionInitialData: JobDistributionInitialData | null;
  jobDistribution: JobDistribution | null;
}

@State<AgencyStateModel>({
  name: 'agency',
  defaults: {
    agency: null,
    agencyPage: null,
    isAgencyLoading: false,
    isOrganizationLoading: false,
    organizations: null,
    associateOrganizationsPages: {
      items: [],
    },
    feeSettings: null,
    feeExceptionsInitialData: null,
    jobDistributionInitialData: null,
    jobDistribution: null,
  },
})
@Injectable()
export class AgencyState {
  @Selector()
  static isAgencyCreated(state: AgencyStateModel): boolean {
    return !!state.agency?.agencyDetails.id;
  }

  @Selector()
  static organizations(state: AgencyStateModel): Organization[] {
    return state.organizations?.items || [];
  }

  @Selector()
  static associateOrganizationsItems(state: AgencyStateModel): AssociateOrganizations[] {
    return state.associateOrganizationsPages.items;
  }

  @Selector()
  static agencies(state: AgencyStateModel): AgencyPage | null {
    return state.agencyPage;
  }

  @Selector()
  static feeExceptionsPage(state: AgencyStateModel): FeeExceptionsPage | undefined {
    return state.feeSettings?.feeExceptions;
  }

  @Selector()
  static feeExceptionsInitialData(state: AgencyStateModel): FeeExceptionsInitialData | null {
    return state.feeExceptionsInitialData;
  }

  @Selector()
  static jobDistributionInitialData(state: AgencyStateModel): JobDistributionInitialData | null {
    return state.jobDistributionInitialData;
  }

  @Selector()
  static jobDistribution(state: AgencyStateModel): JobDistribution | null {
    return state.jobDistribution;
  }

  @Selector()
  static baseFee(state: AgencyStateModel): number | null | undefined {
    return state.feeSettings?.baseFee;
  }

  constructor(
    private agencyService: AgencyService,
    private organizationService: OrganizationService,
    private associateOrganizationsService: AssociateOrganizationsService,
    private feeExceptionsService: FeeExceptionsService
  ) {}

  @Action(SaveAgency)
  SaveAgency({ patchState, dispatch }: StateContext<AgencyStateModel>, { payload }: SaveAgency): Observable<Agency> {
    patchState({ isAgencyLoading: true });
    return this.agencyService.saveAgency(payload).pipe(
      tap((payload) => {
        patchState({ isAgencyLoading: false, agency: payload });
        dispatch(new SaveAgencySucceeded(payload));
        if (payload.agencyDetails.id) {
          dispatch(new ShowToast(MessageTypes.Success, RECORD_MODIFIED));
        } else {
          dispatch(new ShowToast(MessageTypes.Success, RECORD_ADDED));
        }
        return payload;
      })
    );
  }

  @Action(GetOrganizationsByPage)
  GetOrganizationsByPage(
    { patchState }: StateContext<AgencyStateModel>,
    { pageNumber, pageSize }: GetOrganizationsByPage
  ): Observable<OrganizationPage> {
    patchState({ isOrganizationLoading: true });
    return this.organizationService.getOrganizations(pageNumber, pageSize).pipe(
      tap((payload) => {
        patchState({ isOrganizationLoading: false, organizations: payload });
        return payload;
      })
    );
  }

  @Action(InvateOrganizations)
  InvateOrganizations(
    { patchState, dispatch, getState }: StateContext<AgencyStateModel>,
    { organizationIds }: InvateOrganizations
  ): Observable<AssociateOrganizations[]> {
    const state = getState();
    const businessUnitId = state.agency?.createUnder?.id;
    return businessUnitId
      ? this.associateOrganizationsService.invateOrganizations(businessUnitId, organizationIds).pipe(
          tap((payload) => {
            const associateOrganizationsPages = {
              ...state.associateOrganizationsPages,
              items: [...state.associateOrganizationsPages.items, ...payload],
            };
            patchState({ associateOrganizationsPages });
            dispatch(new InvateOrganizationsSucceeded(payload));
          })
        )
      : of();
  }

  @Action(GetAssociateOrganizationsById)
  GetAssociateOrganizationsById(
    { patchState, getState }: StateContext<AgencyStateModel>,
    { pageNumber, pageSize }: GetAssociateOrganizationsById
  ): Observable<AssociateOrganizationsPage> {
    const state = getState();
    const businessUnitId = state.agency?.createUnder?.id;
    return businessUnitId
      ? this.associateOrganizationsService.getOrganizationsById(businessUnitId, pageNumber, pageSize).pipe(
          tap((payload) => {
            patchState({ associateOrganizationsPages: payload });
            return payload;
          })
        )
      : of();
  }

  @Action(GetAgencyByPage)
  GetAgencyByPage({ patchState }: StateContext<AgencyStateModel>, { pageNumber, pageSize }: GetAgencyByPage): Observable<AgencyPage> {
    patchState({ isAgencyLoading: true });
    return this.agencyService.getAgencies(pageNumber, pageSize).pipe(
      tap((payload) => {
        patchState({ isAgencyLoading: false, agencyPage: payload });
        return payload;
      })
    );
  }

  @Action(GetAgencyById)
  GetAgencyById({ patchState, dispatch }: StateContext<AgencyStateModel>, { payload }: GetAgencyById): Observable<Agency> {
    patchState({ isAgencyLoading: true });
    return this.agencyService.getAgencyById(payload).pipe(
      tap((payload) => {
        patchState({ isAgencyLoading: false, agency: payload });
        dispatch(new GetAgencyByIdSucceeded(payload));
        return payload;
      })
    );
  }

  @Action(GetFeeSettingByOrganizationId)
  GetFeeSettingByOrganizationId(
    { patchState, dispatch }: StateContext<AgencyStateModel>,
    { organizationId, pageNumber, pageSize }: GetFeeSettingByOrganizationId
  ): Observable<FeeSettings> {
    return this.associateOrganizationsService.getFeeSettingByOrganizationId(organizationId, pageNumber, pageSize).pipe(
      tap((payload) => {
        patchState({ feeSettings: payload });
        dispatch(new GetFeeSettingByOrganizationIdSucceeded(payload));
        return payload;
      })
    );
  }

  @Action(UploadAgencyLogo)
  UploadOrganizationLogo({ patchState }: StateContext<AgencyStateModel>, { file, businessUnitId }: UploadAgencyLogo): Observable<any> {
    patchState({ isAgencyLoading: true });
    return this.agencyService.saveAgencyLogo(file, businessUnitId).pipe(
      tap((payload) => {
        patchState({ isAgencyLoading: false });
        return payload;
      })
    );
  }

  @Action(GetAgencyLogo)
  GetOrganizationLogo({ dispatch }: StateContext<AgencyStateModel>, { payload }: GetAgencyLogo): Observable<any> {
    return this.agencyService.getAgencyLogo(payload).pipe(
      tap((payload) => {
        dispatch(new GetAgencyLogoSucceeded(payload));
        return payload;
      })
    );
  }

  @Action(ClearAgencyEditStore)
  ClearAgencyEditStore({ patchState }: StateContext<AgencyStateModel>): void {
    patchState({
      agency: null,
      organizations: null,
      associateOrganizationsPages: {
        items: [],
      },
      feeSettings: null,
    });
  }

  @Action(DeleteAssociateOrganizationsById)
  DeleteAssociateOrganizationsById(
    { dispatch, patchState, getState }: StateContext<AgencyStateModel>,
    { id }: DeleteAssociateOrganizationsById
  ): Observable<never> {
    const state = getState();
    const associateOrganizationsPages = {
      ...state.associateOrganizationsPages,
      items: state.associateOrganizationsPages.items.filter((item) => item.id !== id),
    };
    return this.associateOrganizationsService.deleteAssociateOrganizationsById(id).pipe(
      tap(() => {
        patchState({ associateOrganizationsPages });
        dispatch(new DeleteAssociateOrganizationsByIdSucceeded());
      })
    );
  }

  @Action(GetFeeExceptionsInitialData)
  GetFeeExceptionsInitialData(
    { patchState }: StateContext<AgencyStateModel>,
    { organizationId }: GetFeeExceptionsInitialData
  ): Observable<FeeExceptionsInitialData> {
    return this.feeExceptionsService.getFeeExceptionsInitialData(organizationId).pipe(
      tap((payload) => {
        patchState({ feeExceptionsInitialData: payload });
      })
    );
  }

  @Action(GetJobDistributionInitialData)
  GetJobDistributionInitialData(
    { patchState }: StateContext<AgencyStateModel>,
    { organizationId }: GetJobDistributionInitialData
  ): Observable<JobDistributionInitialData> {
    return this.associateOrganizationsService.getJobDistributionInitialData(organizationId).pipe(
      tap((payload) => {
        patchState({ jobDistributionInitialData: payload });
      })
    );
  }

  @Action(SaveJobDistribution)
  SaveJobDistribution(
    { patchState, dispatch }: StateContext<AgencyStateModel>,
    { payload }: SaveJobDistribution
  ): Observable<JobDistribution> {
    patchState({ isAgencyLoading: true });
    return this.associateOrganizationsService.saveJobDistribution(payload).pipe(
      tap((payload) => {
        patchState({ jobDistribution: payload });
        dispatch(new SaveJobDistributionSucceeded(payload));
        dispatch(new ShowToast(MessageTypes.Success, RECORD_SAVED));
        return payload;
      })
    );
  }

  @Action(GetJobDistributionId)
  GetJobDistributionId(
    { patchState }: StateContext<AgencyStateModel>,
    { organizationId }: GetJobDistributionId
  ): Observable<JobDistribution> {
    return this.associateOrganizationsService.getJobDistributionById(organizationId).pipe(
      tap((payload) => {
        patchState({ jobDistribution: payload });
        return payload;
      })
    );
  }

  @Action(SaveFeeExceptions)
  SaveFeeExceptions(
    { patchState, getState, dispatch }: StateContext<AgencyStateModel>,
    { feeExceptionsDTO }: SaveFeeExceptions
  ): Observable<FeeExceptionsPage> {
    const state = getState();
    const baseFee = state.feeSettings?.baseFee;
    return this.feeExceptionsService.saveFeeExceptions(feeExceptionsDTO).pipe(
      tap((payload) => {
        const feeSettings: FeeSettings = {
          baseFee,
          feeExceptions: payload,
        };
        patchState({ feeSettings });
        dispatch(new SaveFeeExceptionsSucceeded(payload));
        dispatch(new ShowToast(MessageTypes.Success, RECORD_ADDED));
        return payload;
      })
    );
  }

  @Action(SaveBaseFee)
  SaveBaseFee(
    { patchState, dispatch, getState }: StateContext<AgencyStateModel>,
    { associateOrganizationId, baseFee }: SaveBaseFee
  ): Observable<FeeSettings> {
    const state = getState();
    return this.associateOrganizationsService.saveBaseFee(associateOrganizationId, baseFee).pipe(
      tap(({ baseFee }) => {
        const feeSettings = {
          feeExceptions: state.feeSettings?.feeExceptions,
          baseFee,
        };
        patchState({ feeSettings });
        dispatch(new ShowToast(MessageTypes.Success, RECORD_SAVED));
      })
    );
  }

  @Action(RemoveFeeExceptionsById)
  RemoveFeeExceptionsById(
    { patchState, getState }: StateContext<AgencyStateModel>,
    { id }: RemoveFeeExceptionsById
  ): Observable<never> {
    const state = getState();
    return this.feeExceptionsService.removeFeeExceptionsById(id).pipe(
      tap(() => {
        const feeSettings = {
          feeExceptions: {
            ...state.feeSettings?.feeExceptions,
            items: state.feeSettings?.feeExceptions?.items.filter((item) => item.id !== id),
          },
          baseFee: state.feeSettings?.baseFee,
        } as FeeSettings;
        patchState({ feeSettings });
      })
    );
  }
}
