import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, NavigationEnd, Router, RouterStateSnapshot } from '@angular/router';

import { Select, Store } from '@ngxs/store';

import { UserState } from '../../store/user.state';
import { Observable, filter, map, of, startWith, switchMap } from 'rxjs';
import { Menu, MenuFunctions } from '@shared/models/menu.model';

@Injectable()
export class MenuGuard implements CanActivate {

  @Select(UserState.menu)
  menu$: Observable<Menu>;

  constructor(
    private store: Store,
    private router: Router,
  ) {}

  public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.menu$.pipe(
      map((menu: Menu) => {
        if (route.data['menuItem']) {
          const result = MenuFunctions.flattenMenuItems(menu.menuItems).includes(route.data['menuItem']);
          if (!result) {
            this.router.navigate(['/']);
            return false;
          }
          return true;
        }
        return true;
      })
    );
}

}
