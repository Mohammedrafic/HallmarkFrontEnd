import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { Observable, tap } from 'rxjs';

import { BusinessUnit } from '@shared/models/business-unit.model';
import { BusinessUnitService } from '@shared/services/business-unit.service';

import { GetBusinessByUnitType, GetRolesPage } from './security.actions';
import { Role, RolesPage } from '@shared/models/roles.model';
import { RolesService } from '../services/roles.service';

const BUSINNESS_DATA_DEFAULT_VALUE = { id: 0, name: 'All' };

interface SecurityStateModel {
  bussinesData: BusinessUnit[];
  rolesPage: RolesPage | null;
}

@State<SecurityStateModel>({
  name: 'security',
  defaults: {
    bussinesData: [],
    rolesPage: null,
  },
})
@Injectable()
export class SecurityState {
  @Selector()
  static bussinesData(state: SecurityStateModel): BusinessUnit[] {
    return [BUSINNESS_DATA_DEFAULT_VALUE, ...state.bussinesData] as BusinessUnit[];
  }

  @Selector()
  static roleGirdData(state: SecurityStateModel): Role[] {
    return state.rolesPage?.items || [];
  }

  @Selector()
  static rolesPage(state: SecurityStateModel): RolesPage | null {
    return state.rolesPage;
  }

  constructor(private businessUnitService: BusinessUnitService, private roleService: RolesService) {}

  @Action(GetBusinessByUnitType)
  GetBusinessByUnitType({ patchState }: StateContext<SecurityStateModel>, { type }: GetBusinessByUnitType): Observable<BusinessUnit[]> {
    return this.businessUnitService.getBusinessByUnitType(type).pipe(
      tap((payload) => {
        patchState({ bussinesData: payload });
        return payload;
      })
    );
  }

  @Action(GetRolesPage)
  GetRolesPage(
    { patchState }: StateContext<SecurityStateModel>,
    { businessUnitId, businessUnitType, pageNumber, pageSize }: GetRolesPage
  ): Observable<RolesPage> {
    return this.roleService.getRolesPage(businessUnitType, businessUnitId, pageNumber, pageSize).pipe(
      tap((payload) => {
        patchState({ rolesPage: payload });
        return payload;
      })
    );
  }
}
