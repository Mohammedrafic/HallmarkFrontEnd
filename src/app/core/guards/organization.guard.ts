import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

import { Store } from '@ngxs/store';

import { User } from '@shared/models/user.model';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { UserState } from '../../store/user.state';

@Injectable()
export class OrganizationGuard implements CanActivate {
  constructor(
    private store: Store,
    private router: Router,
  ) {}

  public canActivate(): boolean {
    return this.canNavigate();
  }

  private canNavigate(): boolean {
    const user = this.store.selectSnapshot(UserState.user) as User;
    const businessUnitType = user.businessUnitType;

    if (
      businessUnitType === BusinessUnitType.Hallmark ||
      businessUnitType === BusinessUnitType.MSP ||
      (businessUnitType === BusinessUnitType.Organization && !user?.isEmployee)
    ) {
      return true;
    }


    this.router.navigate(['']);
    return false;
  }
}
