import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

import { Store } from '@ngxs/store';

import { UserState } from '../../store/user.state';
import { User } from '@shared/models/user.model';

@Injectable()
export class UserLicenceGuard implements CanActivate {
  //TODO: Temporary solution.In the future, it will be removed and replaced by the appropriate guard for each module
  constructor(
    private router: Router,
    private store: Store
  ) {}

  canActivate(): boolean {
    const user = this.store.selectSnapshot(UserState.user) as User;

    if(user?.isEmployee) {
      this.router.navigate(['']);
      return false;
    }

    return true;
  }
}
