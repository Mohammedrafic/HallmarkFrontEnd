import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { catchError, Observable, tap } from 'rxjs';

import { BusinessUnit } from '@shared/models/business-unit.model';
import { BusinessUnitService } from '@shared/services/business-unit.service';

import {
  GetBusinessByUnitType,
  GetNewRoleBusinessByUnitType,
  GetPermissionsTree,
  GetRolesPage,
  RemoveRole,
  SaveRole,
  SaveRoleSucceeded,
} from './security.actions';
import { Role, RolesPage } from '@shared/models/roles.model';
import { RolesService } from '../services/roles.service';
import { PermissionsTree } from '@shared/models/permission.model';
import { RoleTreeField } from '../roles-and-permissions/role-form/role-form.component';
import { ShowToast } from 'src/app/store/app.actions';
import { MessageTypes } from '@shared/enums/message-types';
import { RECORD_ADDED, RECORD_MODIFIED } from '@shared/constants/messages';

const BUSINNESS_DATA_DEFAULT_VALUE = { id: 0, name: 'All' };

interface SecurityStateModel {
  bussinesData: BusinessUnit[];
  rolesPage: RolesPage | null;
  permissionsTree: PermissionsTree;
  isNewRoleDataLoading: boolean;
  newRoleBussinesData: BusinessUnit[];
}

@State<SecurityStateModel>({
  name: 'security',
  defaults: {
    bussinesData: [],
    rolesPage: null,
    permissionsTree: [],
    isNewRoleDataLoading: false,
    newRoleBussinesData: [],
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

  @Selector()
  static roleTreeField(state: SecurityStateModel): RoleTreeField {
    return {
      dataSource: state.permissionsTree,
      id: 'id',
      parentID: 'parentId',
      text: 'name',
      hasChildren: 'hasChild',
    };
  }

  @Selector()
  static isNewRoleDataLoading(state: SecurityStateModel): boolean {
    return state.isNewRoleDataLoading;
  }

  @Selector()
  static newRoleBussinesData(state: SecurityStateModel): BusinessUnit[] {
    return [BUSINNESS_DATA_DEFAULT_VALUE, ...state.newRoleBussinesData] as BusinessUnit[];
  }

  constructor(private businessUnitService: BusinessUnitService, private roleService: RolesService) {}

  @Action(GetBusinessByUnitType)
  GetBusinessByUnitType({ patchState }: StateContext<SecurityStateModel>, { type }: GetBusinessByUnitType): Observable<BusinessUnit[]> {
    return this.businessUnitService.getBusinessByUnitType(type).pipe(
      tap((payload) => {
        patchState({ newRoleBussinesData: payload });
        patchState({ bussinesData: payload });
        return payload;
      })
    );
  }

  @Action(GetNewRoleBusinessByUnitType)
  GetNewRoleBusinessByUnitType(
    { patchState }: StateContext<SecurityStateModel>,
    { type }: GetNewRoleBusinessByUnitType
  ): Observable<BusinessUnit[]> {
    patchState({ isNewRoleDataLoading: true });
    return this.businessUnitService.getBusinessByUnitType(type).pipe(
      tap((payload) => {
        patchState({ isNewRoleDataLoading: false });
        patchState({ newRoleBussinesData: payload });
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

  @Action(GetPermissionsTree)
  GetPermissionsTree({ patchState }: StateContext<SecurityStateModel>, { type }: GetPermissionsTree): Observable<PermissionsTree> {
    patchState({ isNewRoleDataLoading: true });
    return this.roleService.getPermissionsTree(type).pipe(
      tap((payload) => {
        patchState({ permissionsTree: payload });
        patchState({ isNewRoleDataLoading: false });
        return payload;
      })
    );
  }

  @Action(SaveRole)
  SaveRole({ patchState, getState, dispatch }: StateContext<SecurityStateModel>, { role }: SaveRole): Observable<Role> {
    const state = getState();
    return this.roleService.seveRoles(role).pipe(
      tap((payload) => {
        if (state.rolesPage && role.id) {
          const editedRole = state.rolesPage.items.find(({ id }) => id === role.id) as Role;
          const items = [...state.rolesPage.items.filter(({ id }) => id !== editedRole.id), { ...editedRole, ...payload }];
          const rolesPage = { ...state.rolesPage, items };
          patchState({ rolesPage });
          dispatch(new ShowToast(MessageTypes.Success, RECORD_MODIFIED));
        } else if (state.rolesPage) {
          const items = [...state.rolesPage?.items, payload];
          const rolesPage = { ...state.rolesPage, items };
          patchState({ rolesPage });
          dispatch(new ShowToast(MessageTypes.Success, RECORD_ADDED));
        }
        dispatch(new SaveRoleSucceeded(payload));
        return payload;
      })
    );
  }

  @Action(RemoveRole)
  RemoveRole({ patchState, getState, dispatch }: StateContext<SecurityStateModel>, { id }: RemoveRole): Observable<RolesPage> {
    const state = getState();
    return this.roleService.removeRoles(id).pipe(
      tap(() => {
        if (state.rolesPage) {
          const items = state.rolesPage?.items.filter((item) => item.id !== id);
          const rolesPage = { ...state.rolesPage, items };
          patchState({ rolesPage });
        }
      })
    );
  }
}
