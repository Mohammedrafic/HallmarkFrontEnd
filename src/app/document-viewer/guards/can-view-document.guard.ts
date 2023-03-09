import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CanViewDocumentGuard implements CanActivate {
  constructor(private router: Router) {}


  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

      // TODO validate token
      const result = true;
      if (result) {
        return true;
      }
      else {
        this.router.navigate(['/', 'document-viewer', 'failed']);
        return false;
      }
  }

}
