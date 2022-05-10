import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { Observable, tap } from 'rxjs';
import { MENU_CONFIG } from '../shared/constants/menu-config';
import { BusinessUnitType } from '../shared/enums/business-unit-type';
import { ChildMenuItem, Menu, MenuItem } from '../shared/models/menu.model';

import { User } from '../shared/models/user.model';
import { UserService } from '../shared/services/user.service';
import { GetUserMenuConfig, SetCurrentUser } from './user.actions';

export interface UserStateModel {
  user: User | null;
  menu: Menu;
}

@State<UserStateModel>({
  name: 'user',
  defaults: {
    user: JSON.parse(window.localStorage.getItem('User') as string),
    menu: { menuItems: [] },
  },
})
@Injectable()
export class UserState {

  constructor(private userService: UserService) { }

  @Selector()
  static user(state: UserStateModel): User | null { return state.user; }

  @Selector()
  static menu(state: UserStateModel): Menu { return state.menu; }

  @Action(SetCurrentUser)
  SetCurrentUser({ patchState }: StateContext<UserStateModel>, { payload }: SetCurrentUser): void {
    window.localStorage.setItem("AuthKey", payload.id);
    window.localStorage.setItem("UserData", payload.businessUnitName + payload.id);
    window.localStorage.setItem("User", JSON.stringify(payload));
    patchState({ user: payload });
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
