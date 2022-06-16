import { Injectable } from '@angular/core';

import { catchError, Observable, tap } from 'rxjs';
import { Action, createSelector, Selector, State, StateContext } from '@ngxs/store';

import { Organisation, UserVisibilitySettingsPage } from '@shared/models/visibility-settings.model';
import { BusinessUnit } from '@shared/models/business-unit.model';
import { BusinessUnitService } from '@shared/services/business-unit.service';

import {
  GetBusinessByUnitType,
  GetNewRoleBusinessByUnitType,
  GetRolesForCopy,
  GetPermissionsTree,
  GetRolePerUser,
  GetRolesPage,
  GetUsersPage,
  RemoveRole,
  SaveRole,
  SaveRoleSucceeded,
  SaveUser,
  SaveUserSucceeded,
  GetUserVisibilitySettingsPage,
  SaveUserVisibilitySettings,
  SaveUserVisibilitySettingsSucceeded,
  RemoveUserVisibilitySetting,
  RemoveUserVisibilitySettingSucceeded,
  GetOrganizationsStructureAll,
  GetNewRoleBusinessByUnitTypeSucceeded,
} from './security.actions';
import { Role, RolesPage } from '@shared/models/roles.model';
import { RolesService } from '../services/roles.service';
import { PermissionsTree } from '@shared/models/permission.model';
import { RoleTreeField } from '../roles-and-permissions/role-form/role-form.component';
import { ShowToast } from 'src/app/store/app.actions';
import { MessageTypes } from '@shared/enums/message-types';
import { RECORD_ADDED, RECORD_MODIFIED } from '@shared/constants/messages';
import { HttpErrorResponse } from '@angular/common/http';
import { UsersService } from '../services/users.service';
import { RolesPerUser, User, UsersPage } from '@shared/models/user-managment-page.model';
import { BusinessUnitType } from '@shared/enums/business-unit-type';

const BUSINNESS_DATA_DEFAULT_VALUE = { id: 0, name: 'All' };
const BUSINNESS_DATA_HALLMARK_VALUE = { id: 0, name: 'Hallmark' };

interface SecurityStateModel {
  bussinesData: BusinessUnit[];
  usersPage: UsersPage | null;
  rolesPage: RolesPage | null;
  rolesPerUsers: RolesPerUser[] | null;
  permissionsTree: PermissionsTree;
  isNewRoleDataLoading: boolean;
  newRoleBussinesData: BusinessUnit[];
  userVisibilitySettingsPage: UserVisibilitySettingsPage | null;
  copyRoleData: Role[];
  organizations: Organisation[];
}

@State<SecurityStateModel>({
  name: 'security',
  defaults: {
    bussinesData: [],
    rolesPage: null,
    usersPage: null,
    rolesPerUsers: [],
    permissionsTree: [],
    isNewRoleDataLoading: false,
    newRoleBussinesData: [],
    userVisibilitySettingsPage: null,
    copyRoleData: [],
    organizations: [],
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
  static rolesPerUsers(state: SecurityStateModel): RolesPerUser[] | null {
    return state.rolesPerUsers;
  }

  @Selector()
  static rolesPage(state: SecurityStateModel): RolesPage | null {
    return state.rolesPage;
  }

  @Selector()
  static userGridData(state: SecurityStateModel): User[] {
    return state.usersPage?.items || [];
  }

  @Selector()
  static usersPage(state: SecurityStateModel): UsersPage | null {
    return state.usersPage;
  }

  @Selector()
  static userVisibilitySettingsPage(state: SecurityStateModel): UserVisibilitySettingsPage | null {
    return state.userVisibilitySettingsPage;
  }

  @Selector()
  static organisations(state: SecurityStateModel): Organisation[] {
    return state.organizations;
  }

  @Selector()
  static copyRoleData(state: SecurityStateModel): Role[] {
    return state.copyRoleData;
  }

  static getPermissionsForCopyById(id: number) {
    return createSelector([SecurityState], (state: SecurityStateModel): string[] => {
      const role = state.copyRoleData.find((role) => role.id === id);
      return role?.permissions.map(String) || [];
    });
  }

  @Selector()
  static roleTreeField(state: SecurityStateModel): RoleTreeField {
    return {
      dataSource: state.permissionsTree.filter(({ isAvailable }) => isAvailable),
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
  static newRoleBussinesData(state: SecurityStateModel): (type: BusinessUnitType) => BusinessUnit[] {
    return (type: BusinessUnitType) =>
      type === BusinessUnitType.Hallmark
        ? ([BUSINNESS_DATA_DEFAULT_VALUE, ...state.newRoleBussinesData] as BusinessUnit[])
        : (state.newRoleBussinesData as BusinessUnit[]);
  }

  @Selector()
  static newBusinessDataPerUser(state: SecurityStateModel): (type: number) => BusinessUnit[] {
    return (type: number) =>
      type === 1
        ? ([BUSINNESS_DATA_HALLMARK_VALUE, ...state.newRoleBussinesData] as BusinessUnit[])
        : state.newRoleBussinesData;
  }

  @Selector()
  static businessUserData(state: SecurityStateModel): (type: number) => BusinessUnit[] {
    return (type: number) =>
      type === 1
        ? ([BUSINNESS_DATA_HALLMARK_VALUE, ...state.newRoleBussinesData] as BusinessUnit[])
        : ([BUSINNESS_DATA_DEFAULT_VALUE, ...state.newRoleBussinesData] as BusinessUnit[]);
  }

  constructor(
    private businessUnitService: BusinessUnitService,
    private roleService: RolesService,
    private userService: UsersService
  ) {}

  @Action(GetBusinessByUnitType)
  GetBusinessByUnitType(
    { patchState }: StateContext<SecurityStateModel>,
    { type }: GetBusinessByUnitType
  ): Observable<BusinessUnit[]> {
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
    { patchState, dispatch }: StateContext<SecurityStateModel>,
    { type }: GetNewRoleBusinessByUnitType
  ): Observable<BusinessUnit[]> {
    patchState({ isNewRoleDataLoading: true });
    return this.businessUnitService.getBusinessByUnitType(type).pipe(
      tap((payload) => {
        patchState({ isNewRoleDataLoading: false });
        patchState({ newRoleBussinesData: payload });
        dispatch(new GetNewRoleBusinessByUnitTypeSucceeded(type));
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

  @Action(GetRolePerUser)
  GetRolesPerPage(
    { patchState }: StateContext<SecurityStateModel>,
    { businessUnitId, businessUnitType }: GetRolePerUser
  ): Observable<RolesPerUser[]> {
    return this.userService.getRolesPerUser(businessUnitId, businessUnitType).pipe(
      tap((payload) => {
        patchState({ rolesPerUsers: payload });
        return payload;
      })
    );
  }

  @Action(GetUsersPage)
  GetUsersPage(
    { patchState }: StateContext<SecurityStateModel>,
    { businessUnitId, businessUnitType, pageNumber, pageSize }: GetUsersPage
  ): Observable<UsersPage> {
    return this.userService.getUsersPage(businessUnitType, businessUnitId, pageNumber, pageSize).pipe(
      tap((payload) => {
        patchState({ usersPage: payload });
        return payload;
      })
    );
  }

  @Action(GetPermissionsTree)
  GetPermissionsTree(
    { patchState }: StateContext<SecurityStateModel>,
    { type }: GetPermissionsTree
  ): Observable<PermissionsTree> {
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
  SaveRole(
    { patchState, getState, dispatch }: StateContext<SecurityStateModel>,
    { role }: SaveRole
  ): Observable<Role | void> {
    const state = getState();
    return this.roleService.seveRoles(role).pipe(
      tap((payload) => {
        if (state.rolesPage && role.id) {
          const editedRole = state.rolesPage.items.find(({ id }) => id === role.id) as Role;
          const items = [
            ...state.rolesPage.items.filter(({ id }) => id !== editedRole.id),
            { ...editedRole, ...payload },
          ];
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
      }),
      catchError((error: HttpErrorResponse) => dispatch(new ShowToast(MessageTypes.Error, error.error.detail)))
    );
  }

  @Action(SaveUser)
  SaveUser(
    { patchState, getState, dispatch }: StateContext<SecurityStateModel>,
    { user }: SaveUser
  ): Observable<User | void> {
    const state = getState();
    return this.userService.saveUser(user).pipe(
      tap((payload) => {
        if (state.usersPage && user.metadata.id) {
          const editedUser = state.usersPage.items.find(({ id }) => id === user.metadata.id) as User;
          const items = [
            { ...editedUser, ...payload },
            ...state.usersPage.items.filter(({ id }) => id !== editedUser.id),
          ];
          const usersPage = { ...state.usersPage, items };
          patchState({ usersPage });
          dispatch(new ShowToast(MessageTypes.Success, RECORD_MODIFIED));
        } else if (state.usersPage) {
          const items = [payload, ...state.usersPage?.items];
          const usersPage = { ...state.usersPage, items } as UsersPage;
          patchState({ usersPage });
          dispatch(new ShowToast(MessageTypes.Success, RECORD_ADDED));
        }
        dispatch(new SaveUserSucceeded(payload));
        return payload;
      }),
      catchError((error: HttpErrorResponse) => dispatch(new ShowToast(MessageTypes.Error, error.error.detail)))
    );
  }

  @Action(RemoveRole)
  RemoveRole({ patchState, getState }: StateContext<SecurityStateModel>, { id }: RemoveRole): Observable<RolesPage> {
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

  @Action(GetRolesForCopy)
  GetRolesForCopy({ patchState }: StateContext<SecurityStateModel>, { id, type }: GetRolesForCopy): Observable<Role[]> {
    return this.roleService.getRolesForCopy(type, id).pipe(
      tap((payload) => {
        patchState({ copyRoleData: payload });
      })
    );
  }

  @Action(GetUserVisibilitySettingsPage)
  GetUserVisibilitySettingsPage(
    { patchState, dispatch }: StateContext<SecurityStateModel>,
    { userId }: GetUserVisibilitySettingsPage
  ): Observable<UserVisibilitySettingsPage | void> {
    return this.userService.getUserVisibilitySettingsPage(userId).pipe(
      tap((payload) => {
        patchState({ userVisibilitySettingsPage: payload });
        return payload;
      }),
      catchError((error: HttpErrorResponse) => {
        patchState({ userVisibilitySettingsPage: null });
        return dispatch(new ShowToast(MessageTypes.Error, error.error.detail));
      })
    );
  }

  @Action(SaveUserVisibilitySettings)
  SaveUserVisibilitySettings(
    { dispatch }: StateContext<SecurityStateModel>,
    { payload }: SaveUserVisibilitySettings
  ): Observable<UserVisibilitySettingsPage> {
    return this.userService.saveUserVisibilitySettings(payload).pipe(
      tap((payload) => {
        dispatch(new SaveUserVisibilitySettingsSucceeded());
        dispatch(new ShowToast(MessageTypes.Success, RECORD_MODIFIED));
        return payload;
      })
    );
  }

  @Action(RemoveUserVisibilitySetting)
  RemoveUserVisibilitySetting(
    { dispatch }: StateContext<SecurityStateModel>,
    { id, userId }: RemoveUserVisibilitySetting
  ): Observable<void> {
    return this.userService.removeUserVisibilitySettings(id, userId).pipe(
      tap(() => dispatch(new RemoveUserVisibilitySettingSucceeded())),
      catchError((error: HttpErrorResponse) => dispatch(new ShowToast(MessageTypes.Error, error.error.detail)))
    );
  }

  @Action(GetOrganizationsStructureAll)
  GetOrganizationsStructureAll(
    { patchState }: StateContext<SecurityStateModel>,
    { userId }: GetOrganizationsStructureAll
  ): Observable<Organisation[]> {
    return this.userService.getUserVisibilitySettingsOrganisation(userId).pipe(
      tap((payload) => {
        patchState({ organizations: payload });
        return payload;
      })
    );
  }
}

