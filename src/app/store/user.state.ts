import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { Observable, tap } from 'rxjs';
import { MENU_CONFIG } from '../shared/constants/menu-config';
import { AUTH_STORAGE_KEY, USER_STORAGE_KEY } from '@shared/constants/local-storage-keys';
import { ChildMenuItem, Menu, MenuItem } from '../shared/models/menu.model';

import { User } from '../shared/models/user.model';
import { UserService } from '../shared/services/user.service';
import { GetUserMenuConfig, SetCurrentUser, LogoutUser } from './user.actions';

export interface UserStateModel {
  user: User | null;
  menu: Menu;
}

@State<UserStateModel>({
  name: 'user',
  defaults: {
    user: JSON.parse(window.localStorage.getItem(USER_STORAGE_KEY) as string),
    menu: { menuItems: [] },
  },
})
@Injectable()
export class UserState {

  constructor(
    private router: Router,
    private userService: UserService
  ) { }

  @Selector()
  static user(state: UserStateModel): User | null { return state.user; }

  @Selector()
  static menu(state: UserStateModel): Menu { return state.menu; }

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
    this.router.navigate(['/login']);
    patchState({ user: null });
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
}
