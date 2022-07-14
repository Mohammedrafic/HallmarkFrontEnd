import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

import { USER_STORAGE_KEY } from '@shared/constants/local-storage-keys';

@Injectable({
  providedIn: 'root'
})
export class ShellGuard implements CanActivate {
  constructor(private router: Router) { }

  canActivate(): boolean {
    const user = window.localStorage.getItem(USER_STORAGE_KEY);

    if (user) {
      return true;
    }

    this.router.navigate(['/login']);
    return false;
  }
}
