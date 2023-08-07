import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';

import { Store } from '@ngxs/store';

import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { User } from '@shared/models/user.model';
import { AllowedAgencyUrlForOrgUser } from '@core/guards/guards.constant';
import { HasCandidatesLink } from '@core/guards/guards.helper';
import { UserState } from '../../store/user.state';

@Injectable()
export class AgencyGuard implements CanActivate {
  constructor(
    private store: Store,
    private router: Router,
  ) {}

  public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const user = this.store.selectSnapshot(UserState.user) as User;
    const businessUnitType = user.businessUnitType;
    const hasCandidateLinksForOrgUser = HasCandidatesLink(
      state.url,
      businessUnitType,
      user?.isEmployee
    );

    if (
      businessUnitType === BusinessUnitType.Hallmark ||
      businessUnitType === BusinessUnitType.Agency ||
      businessUnitType === BusinessUnitType.MSP
    ) {
      return true;
    }

    if (
      businessUnitType === BusinessUnitType.Organization &&
      !user?.isEmployee &&
      AllowedAgencyUrlForOrgUser.includes(state.url)
    ) {
      return true;
    }

    if (hasCandidateLinksForOrgUser) {
      return true;
    }

   this.router.navigate(['']);
    return false;
  }
}
