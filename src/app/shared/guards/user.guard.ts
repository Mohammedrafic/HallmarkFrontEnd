import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { map, Observable } from 'rxjs';
import { Store } from '@ngxs/store';

import { USER_STORAGE_KEY } from '@shared/constants/local-storage-keys';
import { B2CAuthService } from 'src/app/b2c-auth/b2c-auth.service';
import { SetCurrentUser } from 'src/app/store/user.actions';
import { UserService } from '../services/user.service';

@Injectable({
  providedIn: 'root',
})
export class UserGuard implements CanActivate {
  constructor(
    private router: Router,
    private userService: UserService,
    private b2CAuthService: B2CAuthService,
    private store: Store
  ) {}

  canActivate(): boolean | Observable<boolean> {
    const user = window.localStorage.getItem(USER_STORAGE_KEY);

    if (user) {
      return true;
    }

    if (!user && this.b2CAuthService.isLoggedIn()) {
      return this.userService.getUser().pipe(
        map((user) => {
          this.store.dispatch(new SetCurrentUser(user));
          return true;
        })
      );
    }

    this.router.navigate(['/login']);
    return false;
  }
}
