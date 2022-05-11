import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

import { AUTH_STORAGE_KEY } from '@shared/constants/local-storage-keys';

@Injectable({
  providedIn: 'root'
})
export class ShellGuard implements CanActivate {
  constructor(private router: Router) { }

  canActivate(): boolean {
    const userId = window.localStorage.getItem(AUTH_STORAGE_KEY);

    if (userId) {
      return true;
    }

    this.router.navigate(['/login']);
    return false;
  }
}
