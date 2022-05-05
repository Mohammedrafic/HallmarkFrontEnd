import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { Observable, of, tap } from 'rxjs';

import { Agency, AgencyPage } from 'src/app/shared/models/agency.model';
import { AssociateOrganizations, AssociateOrganizationsPage } from 'src/app/shared/models/associate-organizations.model';
import { Organization, OrganizationPage } from 'src/app/shared/models/organization.model';
import { OrganizationService } from 'src/app/shared/services/organization.service';
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
} from './agency.actions';

export interface AgencyStateModel {
  isAgencyLoading: boolean;
  agency: Agency | null;
  isOrganizationLoading: boolean;
  organizations: OrganizationPage | null;
  associateOrganizationsPages: AssociateOrganizationsPage | { items: AssociateOrganizationsPage['items'] };
  agencyPage: AgencyPage | null;
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

  constructor(
    private agencyService: AgencyService,
    private organizationService: OrganizationService,
    private associateOrganizationsService: AssociateOrganizationsService
  ) {}

  @Action(SaveAgency)
  SaveAgency({ patchState, dispatch }: StateContext<AgencyStateModel>, { payload }: SaveAgency): Observable<Agency> {
    patchState({ isAgencyLoading: true });
    return this.agencyService.saveAgency(payload).pipe(
      tap((payload) => {
        patchState({ isAgencyLoading: false, agency: payload });
        dispatch(new SaveAgencySucceeded(payload));
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
    const businessUnitId = state.agency?.createUnder?.id || 73;
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
    const businessUnitId = state.agency?.createUnder?.id || 73;
    return this.associateOrganizationsService.getOrganizationsById(businessUnitId, pageNumber, pageSize).pipe(
      tap((payload) => {
        patchState({ associateOrganizationsPages: payload });
        return payload;
      })
    );
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
}
