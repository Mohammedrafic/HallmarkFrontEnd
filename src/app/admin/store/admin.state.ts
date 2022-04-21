import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { Observable, tap } from 'rxjs';
import { Days } from 'src/app/shared/enums/days';
import { Country, UsaStates, CanadaStates } from 'src/app/shared/enums/states';
import { Statuses } from 'src/app/shared/enums/status';
import { Titles } from 'src/app/shared/enums/title';
import { BusinessUnit } from 'src/app/shared/models/business-unit.model';
import { Organization } from 'src/app/shared/models/organization.model';
import { OrganizationService } from '../services/organization.service';

import { CreateOrganization, GetBusinessUnitList, SetBillingStatesByCountry, SetGeneralStatesByCountry } from './admin.actions';

interface DropdownOption {
  id: number;
  text: string;
}

export interface AdminStateModel {
  countries: DropdownOption[];
  statesGeneral: string[] | null;
  statesBilling: string[] | null;
  businessUnits: BusinessUnit[];
  days: DropdownOption[];
  statuses: DropdownOption[];
  titles: string[];
  isOrganizationLoading: boolean;
}

@State<AdminStateModel>({
  name: 'admin',
  defaults: {
    countries: [{ id: Country.USA, text: Country[0] }, { id: Country.Canada, text: Country[1] }],
    statesGeneral: null,
    statesBilling: null,
    businessUnits: [],
    days: Days,
    statuses: Statuses,
    titles: Titles,
    isOrganizationLoading: false,
  },
})
@Injectable()
export class AdminState {
  @Selector()
  static countries(state: AdminStateModel): DropdownOption[] { return state.countries; }

  @Selector()
  static statesGeneral(state: AdminStateModel): string[] | null { return state.statesGeneral; }

  @Selector()
  static statesBilling(state: AdminStateModel): string[] | null { return state.statesBilling; }

  @Selector()
  static businessUnits(state: AdminStateModel): BusinessUnit[] { return state.businessUnits; }

  @Selector()
  static days(state: AdminStateModel): DropdownOption[] { return state.days; }

  @Selector()
  static statuses(state: AdminStateModel): DropdownOption[] { return state.statuses; }

  @Selector()
  static titles(state: AdminStateModel): string[] { return state.titles; }

  constructor(
    private organizationService: OrganizationService,
  ) { }

  @Action(SetGeneralStatesByCountry)
  SetGeneralStatesByCountry({ patchState }: StateContext<AdminStateModel>, { payload }: SetGeneralStatesByCountry): void {
    patchState({ statesGeneral: payload === Country[Country.USA] ? UsaStates : CanadaStates });
  }

  @Action(SetBillingStatesByCountry)
  SetBillingStatesByCountry({ patchState }: StateContext<AdminStateModel>, { payload }: SetBillingStatesByCountry): void {
    patchState({ statesBilling: payload === Country[Country.USA] ? UsaStates : CanadaStates });
  }

  @Action(CreateOrganization)
  CreateOrganization({ patchState }: StateContext<AdminStateModel>, { payload }: CreateOrganization): Observable<Organization> {
    patchState({ isOrganizationLoading: true });
    return this.organizationService.saveOrganization(payload).pipe(tap((payload) => {
      patchState({ isOrganizationLoading: false});
      return payload;
    }));
  }

  @Action(GetBusinessUnitList)
  GetBusinessUnitList({ patchState }: StateContext<AdminStateModel>, { }: GetBusinessUnitList): Observable<BusinessUnit[]> {
    return this.organizationService.getBusinessUnit().pipe(tap((payload) => {
      patchState({ businessUnits: payload});
      return payload;
    }));
  }
}
