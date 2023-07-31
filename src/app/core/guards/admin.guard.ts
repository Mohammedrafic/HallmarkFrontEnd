import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';

import { Store } from '@ngxs/store';

import { AllowedAdminUrlForAgencyUser, AllowedAdminUrlForOrgUser } from '@core/guards/guards.constant';
import { User } from '@shared/models/user.model';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { UserState } from '../../store/user.state';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    private store: Store,
    private router: Router,
  ) {}

  public canActivate(route: ActivatedRouteSnapshot,state: RouterStateSnapshot): boolean {
    const user = this.store.selectSnapshot(UserState.user) as User;
    const businessUnitType = user.businessUnitType;

    if (
      businessUnitType === BusinessUnitType.Hallmark ||
      businessUnitType === BusinessUnitType.MSP
    ) {
      return true;
    }

    if (
      businessUnitType === BusinessUnitType.Organization &&
      !user?.isEmployee &&
      AllowedAdminUrlForOrgUser.includes(state.url)
    ) {
      return true;
    }

    if (
      businessUnitType === BusinessUnitType.Agency &&
      AllowedAdminUrlForAgencyUser.includes(state.url)
    ) {
      return true;
    }

    this.router.navigate(['']);
    return false;
  }
}
