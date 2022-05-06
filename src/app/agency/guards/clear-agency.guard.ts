import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { ClearAgencyEditStore } from '../store/agency.actions';

@Injectable({
  providedIn: 'root'
})
export class ClearAgencyGuard implements CanDeactivate<unknown> {
  constructor(private store: Store) {}
  canDeactivate(component: unknown, currentRoute: ActivatedRouteSnapshot, currentState: RouterStateSnapshot, nextState?: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    this.store.dispatch(new ClearAgencyEditStore());
    return true;
  }
 
}
