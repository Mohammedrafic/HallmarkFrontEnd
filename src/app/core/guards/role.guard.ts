import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanLoad, Route, Router } from '@angular/router';

import { Store } from '@ngxs/store';

import { User } from '@shared/models/user.model';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { UserState } from '../../store/user.state';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate, CanLoad {
  constructor(
    private store: Store,
    private router: Router,
  ) {}

  public canActivate(route: ActivatedRouteSnapshot): boolean {
   return this.canNavigate(route);
  }

  public canLoad(route: Route): boolean {
    return this.canNavigate(route);
  }

  private canNavigate(route: ActivatedRouteSnapshot | Route): boolean {
    const user = this.store.selectSnapshot(UserState.user) as User;
    const businessUnitType = user.businessUnitType;
    const routeRoles = route.data ? route.data['roles'] : [];

    if (
      businessUnitType === BusinessUnitType.Organization &&
      !user?.isEmployee &&
      routeRoles.includes(businessUnitType)
    ) {
      return true;
    }

    if (routeRoles.includes(businessUnitType)) {
      return true;
    }

    this.router.navigate(['']);
    return false;
  }
}
