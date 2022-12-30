import { Injectable, Type } from '@angular/core';
import { ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { NavigationWrapperService } from '@shared/services/navigation-wrapper.service';
import { NavigationConfigurationModel } from '@shared/models/navigation-configuration.model';

@Injectable({
  providedIn: 'root'
})
export class NavigateWithChangesGuard implements CanDeactivate<Type<any>> {
  constructor(private navigationWrapperService: NavigationWrapperService) {
  }

  canDeactivate(
    component: Type<any>,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState?: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const configuration: NavigationConfigurationModel = { route: nextState?.url ?? '' };
    const canNavigate = this.navigationWrapperService.canNavigate(configuration);

    return of(canNavigate);
  }
}
