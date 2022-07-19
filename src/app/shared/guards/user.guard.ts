import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { CanActivate, Router } from '@angular/router';
import { catchError, delay, map, Observable, tap } from 'rxjs';
import { Store } from '@ngxs/store';

import { USER_STORAGE_KEY } from '@shared/constants/local-storage-keys';
import { B2CAuthService } from 'src/app/b2c-auth/b2c-auth.service';
import { SetCurrentUser } from 'src/app/store/user.actions';
import { UserService } from '../services/user.service';
import { ShowToast } from 'src/app/store/app.actions';
import { MessageTypes } from '@shared/enums/message-types';

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
        }),
        catchError((error: HttpErrorResponse) =>
          this.store.dispatch(new ShowToast(MessageTypes.Error, error.error.detail)).pipe(
            delay(5000),
            tap(() => {
              this.b2CAuthService.logout();
            })
          )
        )
      );
    }

    this.router.navigate(['/login']);
    return false;
  }
}
