import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { MessageTypes } from '@shared/enums/message-types';
import { CurrentUserPermission } from '@shared/models/permission.model';
import { getAllErrors } from '@shared/utils/error.utils';
import { catchError, map, Observable, tap } from 'rxjs';
import { ShowToast } from 'src/app/store/app.actions';
import { MENU_CONFIG } from '@shared/constants';
import {
  AGENCY_ID_STORAGE_KEY,
  LAST_SELECTED_BUSINESS_UNIT_TYPE,
  ORG_ID_STORAGE_KEY,
  USER_STORAGE_KEY
} from '@shared/constants/local-storage-keys';
import { ChildMenuItem, Menu, MenuItem } from '@shared/models/menu.model';

import { User, UsersAssignedToRole } from '@shared/models/user.model';
import { UserService } from '@shared/services/user.service';
import {
  ClearOrganizationStructure,
  GetCurrentUserPermissions,
  GetOrderPermissions,
  GetOrganizationStructure, GetOrgTierStructure,
  GetUserAgencies,
  GetUserMenuConfig,
  GetUserOrganizations,
  GetUsersAssignedToRole,
  LastSelectedOrganisationAgency,
  LogoutUser,
  SaveLastSelectedOrganizationAgencyId,
  SetAgencyActionsAllowed,
  SetAgencyInvoicesActionsAllowed,
  SetCurrentUser,
  SetLastSelectedOrganizationAgencyId,
  SetUserPermissions
} from './user.actions';
import { LasSelectedOrganizationAgency, UserAgencyOrganization } from '@shared/models/user-agency-organization.model';
import { OrganizationDepartment, OrganizationLocation, OrganizationRegion, OrganizationStructure } from '@shared/models/organization.model';
import { OrganizationService } from '@shared/services/organization.service';
import { B2CAuthService } from '../b2c-auth/b2c-auth.service';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { Permission } from '@core/interface';
import { UserPermissionsService } from '@core/services';
import { PermissionsAdapter } from '@core/helpers/adapters';

export interface UserStateModel {
  user: User | null;
  menu: Menu;
  agencies: UserAgencyOrganization | null;
  organizations: UserAgencyOrganization | null;
  lastSelectedOrganisationAgency: string | null;
  lastSelectedOrganizationId: number | null;
  lastSelectedAgencyId: number | null;
  organizationStructure: OrganizationStructure | null;
  usersAssignedToRole: UsersAssignedToRole | null;
  permissions: CurrentUserPermission[];
  orderPermissions: CurrentUserPermission[];
  agencyActionsAllowed: boolean;
  agencyInvoicesActionsAllowed: boolean;
  userPermission: Permission;
  tireOrganizationStructure: OrganizationStructure | null;
}

const AGENCY = 'Agency';

@State<UserStateModel>({
  name: 'user',
  defaults: {
    user: JSON.parse(window.localStorage.getItem(USER_STORAGE_KEY) as string),
    menu: { menuItems: [] },
    agencies: null,
    organizations: null,
    lastSelectedOrganisationAgency: window.localStorage.getItem(LAST_SELECTED_BUSINESS_UNIT_TYPE) || null,
    lastSelectedOrganizationId: parseInt(window.localStorage.getItem(ORG_ID_STORAGE_KEY) as string) || null,
    lastSelectedAgencyId: parseInt(window.localStorage.getItem(AGENCY_ID_STORAGE_KEY) as string) || null,
    organizationStructure: null,
    tireOrganizationStructure: null,
    usersAssignedToRole: null,
    permissions: [],
    orderPermissions: [],
    agencyActionsAllowed: true,
    agencyInvoicesActionsAllowed: true,
    userPermission: {}
  },
})
@Injectable()
export class UserState {
  constructor(
    private userService: UserService,
    private organizationService: OrganizationService,
    private b2CAuthService: B2CAuthService,
    private userPermissionsService: UserPermissionsService
  ) {}

  @Selector()
  static userPermission(state: UserStateModel): Permission {
    return state.userPermission;
  }

  @Selector()
  static user(state: UserStateModel): User | null {
    return state.user;
  }

  @Selector()
  static userChatConfig(state: UserStateModel): boolean {
    return !!state.user?.isChatEnabled;
  }

  @Selector()
  static businessUnitName(state: UserStateModel): string {
    return state.lastSelectedOrganisationAgency === AGENCY
      ? state.agencies?.businessUnits.find((item) => item.id === state.lastSelectedAgencyId)?.name || ''
      : state.organizations?.businessUnits.find((item) => item.id === state.lastSelectedOrganizationId)?.name || '';
  }

  @Selector()
  static menu(state: UserStateModel): Menu {
    return state.menu;
  }

  @Selector()
  static agencies(state: UserStateModel): UserAgencyOrganization | null {
    return state.agencies;
  }

  @Selector()
  static organizations(state: UserStateModel): UserAgencyOrganization | null {
    return state.organizations;
  }

  @Selector()
  static lastSelectedOrganizationId(state: UserStateModel): number | null {
    return state.lastSelectedOrganizationId;
  }

  @Selector()
  static lastSelectedAgencyId(state: UserStateModel): number | null {
    return state.lastSelectedAgencyId;
  }

  @Selector()
  static organizationStructure(state: UserStateModel): OrganizationStructure | null {
    return state.organizationStructure;
  }

  @Selector()
  static lastSelectedOrganizationAgency(state: UserStateModel): string | null {
    return state.lastSelectedOrganisationAgency;
  }

  @Selector()
  static usersAssignedToRole(state: UserStateModel): UsersAssignedToRole | null {
    return state.usersAssignedToRole;
  }

  @Selector()
  static tireOrganizationStructure(state: UserStateModel): OrganizationStructure | null {
    return state.tireOrganizationStructure;
  }

  @Selector()
  static currentUserPermissions(state: UserStateModel): CurrentUserPermission[] {
    return state.permissions;
  }

  @Selector()
  static currentUserPermissionsIds(state: UserStateModel): number[] {
    return state.permissions.map(({ permissionId }) => permissionId);
  }

  @Selector()
  static orderPermissions(state: UserStateModel): CurrentUserPermission[] {
    return state.orderPermissions;
  }

  @Selector()
  static isHallmarkUser(state: UserStateModel): boolean {
    return state.user?.businessUnitType === BusinessUnitType.Hallmark;
  }

  @Selector()
  static isMspUser(state: UserStateModel): boolean {
    return state.user?.businessUnitType === BusinessUnitType.MSP;
  }

  @Selector()
  static isAgencyUser(state: UserStateModel): boolean {
    return state.user?.businessUnitType === BusinessUnitType.Agency;
  }

  @Selector([UserState.isHallmarkUser, UserState.isMspUser])
  static isHallmarkMspUser(state: UserState, isHalmark: boolean, isMsp: boolean): boolean {
    return isHalmark || isMsp;
  }

  @Selector()
  static agencyActionsAllowed(state: UserStateModel): boolean {
    return state.agencyActionsAllowed;
  }

  @Selector()
  static agencyInvoicesActionsAllowed(state: UserStateModel): boolean {
    return state.agencyInvoicesActionsAllowed;
  }

  @Action(SetCurrentUser)
  SetCurrentUser({ patchState }: StateContext<UserStateModel>, { payload }: SetCurrentUser): void {
    window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(payload));
    patchState({ user: payload });
  }

  @Action(LogoutUser)
  LogoutUser({ patchState }: StateContext<UserStateModel>): void {
    if (this.b2CAuthService.isLoggedIn()) {
      this.b2CAuthService.logout();
    }

    window.localStorage.clear();

    patchState({
      user: null,
      lastSelectedAgencyId: null,
      lastSelectedOrganizationId: null,
      organizations: null,
      agencies: null,
      menu: { menuItems: [] },
    });
  }

  @Action(GetUserMenuConfig)
  GetUserMenuConfig({ patchState }: StateContext<UserStateModel>, { payload }: GetUserMenuConfig): Observable<Menu> {
    return this.userService.getUserMenuConfig(payload).pipe(
      tap((menu: Menu) => {
        const education = 9;
        const faq = 10;
        const businessUnitType = payload;
        if (businessUnitType) {
          menu.menuItems = menu.menuItems
            .filter((menuItem: MenuItem) => menuItem.id !== education && menuItem.id !== faq)
            .map((menuItem: MenuItem) => {
              menuItem.icon = MENU_CONFIG[businessUnitType][menuItem.id]?.icon;
              menuItem.route = MENU_CONFIG[businessUnitType][menuItem.id]?.route;
              menuItem.anch = menuItem.title;
              menuItem.custom = MENU_CONFIG[businessUnitType][menuItem.id]?.custom;
              if (menuItem.children) {
                menuItem.children = menuItem.children.map((child: any) => {
                  return {
                    id: child.id,
                    title: child.title,
                    route: MENU_CONFIG[businessUnitType][child.id]?.route,
                    icon: '',
                    anch: `${menuItem.title}/${child.title}`,
                  };
                }) as ChildMenuItem[];
              } else {
                menuItem.children = [];
              }
              return menuItem;
            });
        }

        return patchState({ menu: menu });
      })
    );
  }

  @Action(GetUserAgencies)
  GetUserAgencies({ patchState }: StateContext<UserStateModel>): Observable<UserAgencyOrganization> {
    return this.userService.getUserAgencies().pipe(
      tap((agencies: UserAgencyOrganization) => {
        return patchState({ agencies });
      })
    );
  }

  @Action(GetUserOrganizations)
  GetUserOrganizations({ patchState }: StateContext<UserStateModel>): Observable<UserAgencyOrganization> {
    return this.userService.getUserOrganizations().pipe(
      tap((organizations: UserAgencyOrganization) => {
        return patchState({ organizations });
      })
    );
  }

  @Action(SetLastSelectedOrganizationAgencyId)
  SetLastSelectedOrganizationAgencyId(
    { patchState }: StateContext<UserStateModel>,
    { payload }: SaveLastSelectedOrganizationAgencyId
  ): void {
    if (payload.lastSelectedAgencyId) {
      window.localStorage.setItem(AGENCY_ID_STORAGE_KEY, payload.lastSelectedAgencyId?.toString() as string);
      patchState({ lastSelectedAgencyId: payload.lastSelectedAgencyId });
    }
    if (payload.lastSelectedOrganizationId) {
      window.localStorage.setItem(ORG_ID_STORAGE_KEY, payload.lastSelectedOrganizationId?.toString() as string);
      patchState({ lastSelectedOrganizationId: payload.lastSelectedOrganizationId });
    }
  }

  @Action(SaveLastSelectedOrganizationAgencyId)
  SaveLastSelectedOrganizationAgencyId(
    { dispatch }: StateContext<UserStateModel>,
    { payload, isOrganizationId }: SaveLastSelectedOrganizationAgencyId
  ): Observable<LasSelectedOrganizationAgency> {
    return this.userService.saveLastSelectedOrganizationAgencyId(payload).pipe(
      map(() => {
        dispatch(new SetLastSelectedOrganizationAgencyId(payload));
        if (isOrganizationId) {
          dispatch(new GetOrganizationStructure());
        }
        return payload;
      })
    );
  }

  @Action(GetOrganizationStructure)
  GetOrganizationStructure({ patchState }: StateContext<UserStateModel>): Observable<OrganizationStructure> {
    return this.organizationService.getOrganizationStructure().pipe(
      tap((structure: OrganizationStructure) => {
        structure.regions.forEach((region: OrganizationRegion) => {
          region['organizationId'] = structure.organizationId;
          region['regionId'] = region.id;
          region.locations?.forEach((location: OrganizationLocation) => {
            location['organizationId'] = structure.organizationId;
            location['regionId'] = region.id;
            location['locationId'] = location.id;
            location.departments.forEach((department: OrganizationDepartment) => {
              department['organizationId'] = structure.organizationId;
              department['regionId'] = region.id;
              department['locationId'] = location.id;
            });
          });
        });
        return patchState({ organizationStructure: structure });
      })
    );
  }

  @Action(ClearOrganizationStructure)
  ClearOrganizationStructure({ patchState }: StateContext<UserStateModel>) : UserStateModel {
    return patchState({ organizationStructure: null });
  }

  @Action(LastSelectedOrganisationAgency)
  SetLastSelectedOrganizationAgecy(
    { patchState }: StateContext<UserStateModel>,
    { payload }: LastSelectedOrganisationAgency
  ) {
    window.localStorage.setItem(LAST_SELECTED_BUSINESS_UNIT_TYPE, payload);
    return patchState({ lastSelectedOrganisationAgency: payload });
  }

  @Action(GetUsersAssignedToRole)
  GetUsersAssignedToRole(
    { patchState, dispatch }: StateContext<UserStateModel>,
    { payload }: GetUsersAssignedToRole
  ): Observable<any> {
    return this.userService.getUsersAssignedToRole(payload).pipe(
      tap((usersAssignedToRole: UsersAssignedToRole) => patchState({ usersAssignedToRole })),
      catchError((error: HttpErrorResponse) => dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error))))
    );
  }

  @Action(GetCurrentUserPermissions)
  GetCurrentUserPermissions({ patchState, dispatch }: StateContext<UserStateModel>): Observable<void | CurrentUserPermission[]> {
    return this.userService.getCurrentUserPermissions().pipe(
      tap((permissions: CurrentUserPermission[]) => patchState({ permissions })),
      catchError((error: HttpErrorResponse) => dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error))))
    );
  }

  @Action(SetAgencyActionsAllowed)
  SetAgencyStatus(
    { patchState }: StateContext<UserStateModel>,
    { allowed }: SetAgencyActionsAllowed,
  ): void {
    patchState({
      agencyActionsAllowed: allowed,
    });
  }

  @Action(GetOrderPermissions)
  GetOrderPermissions({ patchState, dispatch }: StateContext<UserStateModel>, { payload }: GetOrderPermissions): Observable<void | CurrentUserPermission[]> {
    return this.userService.getOrderPermissions(payload).pipe(
      tap((orderPermissions: CurrentUserPermission[]) => patchState({ orderPermissions })),
      catchError((error: HttpErrorResponse) => dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error))))
    );
  }

  @Action(SetAgencyInvoicesActionsAllowed)
  SetInvoicesActionsAllowed(
    { patchState }: StateContext<UserStateModel>,
    { allowed }: SetAgencyInvoicesActionsAllowed,
  ): void {
    patchState({
      agencyInvoicesActionsAllowed: allowed,
    });
  }

  @Action(SetUserPermissions)
  SetUserPermissions(
    { patchState }: StateContext<UserStateModel>,
  ): Observable<Permission> {
    return this.userPermissionsService.getUserPermissions()
      .pipe(
        map((permissions: number[]) => PermissionsAdapter.adaptUserPermissions(permissions)),
        tap((permissions: Permission) => {
          patchState({userPermission: permissions});
          return permissions;
        })
      );
  }

  @Action(GetOrgTierStructure)
  GetOrgTierStructure(
    { patchState, dispatch }: StateContext<UserStateModel>,
    { organizationId }: GetOrgTierStructure
  ): Observable<OrganizationStructure | void> {
    return this.organizationService.getOrgTierStructure(organizationId).pipe(
      tap((structure: OrganizationStructure) => {
        patchState({tireOrganizationStructure: structure})
      }),
      catchError((error: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)));
      })
    )
  }
}
