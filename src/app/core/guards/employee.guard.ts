import { Injectable } from '@angular/core';
import { CanActivate, CanLoad, Router } from '@angular/router';

import { Store } from '@ngxs/store';

import { UserState } from '../../store/user.state';
import { User } from '@shared/models/user.model';

@Injectable()
export class EmployeeGuard implements CanActivate, CanLoad {
  constructor(
    private router: Router,
    private store: Store
  ) {}

  public canLoad(): boolean {
    return this.canNavigate();
  }

  public canActivate(): boolean {
    return this.canNavigate();
  }

  private canNavigate(): boolean {
    const user = this.store.selectSnapshot(UserState.user) as User;

    if(user?.isEmployee) {
      return user?.isEmployee;
    }

    this.router.navigate(['']);
    return false;
  }
}
