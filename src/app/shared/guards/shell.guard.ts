import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

import { USER_STORAGE_KEY } from '@shared/constants/local-storage-keys';
import { B2CAuthService } from 'src/app/b2c-auth/b2c-auth.service';

@Injectable({
  providedIn: 'root'
})
export class ShellGuard implements CanActivate {
  constructor(private router: Router, private b2CAuthService: B2CAuthService) { }

  canActivate(): boolean {
    const user = window.localStorage.getItem(USER_STORAGE_KEY);

    if (this.b2CAuthService.isLoggedIn() && user) {
      return true;
    }

    this.router.navigate(['/login']);
    return false;
  }
}
