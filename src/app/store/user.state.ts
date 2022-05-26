import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { map, Observable, tap } from 'rxjs';
import { MENU_CONFIG } from '../shared/constants/menu-config';
import { AUTH_STORAGE_KEY, USER_STORAGE_KEY, ORG_ID_STORAGE_KEY, AGENCY_ID_STORAGE_KEY } from '@shared/constants/local-storage-keys';
import { ChildMenuItem, Menu, MenuItem } from '../shared/models/menu.model';

import { User } from '../shared/models/user.model';
import { UserService } from '../shared/services/user.service';
import {
  GetUserMenuConfig,
  SetCurrentUser,
  LogoutUser,
  GetUserAgencies,
  SaveLastSelectedOrganizationAgencyId,
  SetLastSelectedOrganizationAgencyId,
  GetOrganizationStructure
} from './user.actions';
import { LasSelectedOrganizationAgency, UserAgencyOrganization } from '@shared/models/user-agency-organization.model';
import { OrganizationStructure } from '@shared/models/organization.model';
import { OrganizationService } from '@shared/services/organization.service';

export interface UserStateModel {
  user: User | null;
  menu: Menu;
  agencies: UserAgencyOrganization | null;
  organizations: UserAgencyOrganization | null;
  lastSelectedOrganizationId: number | null;
  lastSelectedAgencyId: number | null;
  organizationStructure: OrganizationStructure | null;
}

@State<UserStateModel>({
  name: 'user',
  defaults: {
    user: JSON.parse(window.localStorage.getItem(USER_STORAGE_KEY) as string),
    menu: { menuItems: [] },
    agencies: null,
    organizations: null,
    lastSelectedOrganizationId: parseInt(window.localStorage.getItem(ORG_ID_STORAGE_KEY) as string),
    lastSelectedAgencyId: parseInt(window.localStorage.getItem(AGENCY_ID_STORAGE_KEY) as string),
    organizationStructure: null,
  },
})
@Injectable()
export class UserState {

  constructor(
    private userService: UserService,
    private organizationService: OrganizationService,
  ) { }

  @Selector()
  static user(state: UserStateModel): User | null { return state.user; }

  @Selector()
  static menu(state: UserStateModel): Menu { return state.menu; }

  @Selector()
  static agencies(state: UserStateModel): UserAgencyOrganization | null { return state.agencies }

  @Selector()
  static organizations(state: UserStateModel): UserAgencyOrganization | null { return state.organizations }

  @Selector()
  static lastSelectedOrganizationId(state: UserStateModel): number | null { return state.lastSelectedOrganizationId }

  @Selector()
  static lastSelectedAgencyId(state: UserStateModel): number | null { return state.lastSelectedAgencyId }

  @Selector()
  static organizationStructure(state: UserStateModel): OrganizationStructure | null { return state.organizationStructure }

  @Action(SetCurrentUser)
  SetCurrentUser({ patchState }: StateContext<UserStateModel>, { payload }: SetCurrentUser): void {
    window.localStorage.setItem(AUTH_STORAGE_KEY, payload.id);
    window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(payload));
    patchState({ user: payload });
  }

  @Action(LogoutUser)
  LogoutUser({ patchState }: StateContext<UserStateModel>): void {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    window.localStorage.removeItem(USER_STORAGE_KEY);
    window.localStorage.removeItem(ORG_ID_STORAGE_KEY);
    window.localStorage.removeItem(AGENCY_ID_STORAGE_KEY);
    patchState({
      user: null,
      lastSelectedAgencyId: null,
      lastSelectedOrganizationId: null,
      organizations: null,
      agencies: null,
      menu: { menuItems: [] }
     });
  }

  @Action(GetUserMenuConfig)
  GetUserMenuConfig({ patchState }: StateContext<UserStateModel>, { payload }: GetUserMenuConfig): Observable<Menu> {
    return this.userService.getUserMenuConfig(payload).pipe(tap((menu: Menu) => {
      const education = 9;
      const faq = 10;
      const businessUnitType = payload;
      if (businessUnitType) {
        menu.menuItems = menu.menuItems.filter((menuItem: MenuItem) => menuItem.id !== education && menuItem.id !== faq).map((menuItem: MenuItem) => {
          menuItem.icon = MENU_CONFIG[businessUnitType][menuItem.id].icon;
          menuItem.route = MENU_CONFIG[businessUnitType][menuItem.id].route;
          if (menuItem.children) {
            menuItem.children = menuItem.children.map((child: any) => {
              return {
                title: child.title,
                route: MENU_CONFIG[businessUnitType][child.id].route,
                icon: ''
              };
            }) as ChildMenuItem[];
          } else {
            menuItem.children = [];
          }
          return menuItem;
        });
      }
      return patchState({ menu: menu });
    }));
  }

  @Action(GetUserAgencies)
  GetUserAgencies({ patchState }: StateContext<UserStateModel>): Observable<UserAgencyOrganization> {
    return this.userService.getUserAgencies().pipe(tap((agencies: UserAgencyOrganization) => {
      return patchState({ agencies });
    }));
  }

  @Action(GetUserAgencies)
  GetUserOrganizations({ patchState }: StateContext<UserStateModel>): Observable<UserAgencyOrganization> {
    return this.userService.getUserOrganizations().pipe(tap((organizations: UserAgencyOrganization) => {
      return patchState({ organizations });
    }));
  }

  @Action(SetLastSelectedOrganizationAgencyId)
  SetLastSelectedOrganizationAgencyId(
    { patchState }: StateContext<UserStateModel>,
    { payload }: SaveLastSelectedOrganizationAgencyId
  ): LasSelectedOrganizationAgency {
    window.localStorage.setItem(ORG_ID_STORAGE_KEY, payload.lastSelectedOrganizationId?.toString() as string);
    window.localStorage.setItem(AGENCY_ID_STORAGE_KEY, payload.lastSelectedAgencyId?.toString() as string);
    return patchState({
      lastSelectedOrganizationId: payload.lastSelectedOrganizationId,
      lastSelectedAgencyId: payload.lastSelectedAgencyId
    });
  }

  @Action(SaveLastSelectedOrganizationAgencyId)
  SaveLastSelectedOrganizationAgencyId(
    { dispatch }: StateContext<UserStateModel>,
    { payload }: SaveLastSelectedOrganizationAgencyId
  ): Observable<LasSelectedOrganizationAgency> {
    return this.userService.saveLastSelectedOrganizationAgencyId(payload).pipe(map(() => {
      dispatch(new SetLastSelectedOrganizationAgencyId(payload));
      dispatch(new GetOrganizationStructure());
      return payload;
    }));
  }

  @Action(GetOrganizationStructure)
  GetOrganizationStructure({ patchState }: StateContext<UserStateModel>): Observable<OrganizationStructure> {
    return this.organizationService.getOrganizationStructure().pipe(tap((structure: OrganizationStructure) => {
      return patchState({ organizationStructure: structure });
    }));
  }
}
