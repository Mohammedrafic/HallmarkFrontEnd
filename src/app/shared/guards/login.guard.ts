import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { SsoManagement } from 'src/app/b2c-auth/sso-management';
import { USER_STORAGE_KEY } from '@shared/constants/local-storage-keys';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {
  constructor(private router: Router) { }

  canActivate(): boolean {
    const userId = window.localStorage.getItem(USER_STORAGE_KEY);

    if (userId) {
      const redirect = SsoManagement.getRedirectUrl() || '/';
      SsoManagement.clearRedirectUrl();
      this.router.navigate([redirect]);
      return false;
    }

    return true;
  }
}
