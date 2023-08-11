import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

import { Store } from '@ngxs/store';
import { filter, map, mergeMap } from 'rxjs/operators';
import { B2CAuthService } from './b2c-auth/b2c-auth.service';

import { CheckScreen, SetIsOrganizationAgencyArea } from './store/app.actions';
import { SetUserPermissions } from "./store/user.actions";
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  public isIframe = false;

  constructor(
    private router: Router,
    private store: Store,
    private b2CAuthService: B2CAuthService,
  ) {}

  ngOnInit(): void {
    this.store.dispatch([new CheckScreen()]);

    this.isIframe = window !== window.parent && !window.opener;

    this.b2CAuthService.interactionStatusNone().subscribe();

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.router.routerState.root),
      map((route) => {
        let r = route;
        while (r.firstChild) r = r.firstChild;
        return r;
      }),
      mergeMap(route => route.data)
    ).subscribe(data => {
      if (!data?.['skipAuthentication']) {
        const isOrganizationArea = data?.['isOrganizationArea'] || false;
        const isAgencyArea = data?.['isAgencyArea'] || false;
        this.store.dispatch(new SetIsOrganizationAgencyArea({ isOrganizationArea, isAgencyArea }));
        this.store.dispatch(new SetUserPermissions());
      }
    });
  }
}
