import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

import { Store } from '@ngxs/store';
import { filter, map, mergeMap } from 'rxjs/operators';
import { B2CAuthService } from './b2c-auth/b2c-auth.service';

import { CheckScreen, SetIsOrganizationAgencyArea } from './store/app.actions';
import { SetUserPermissions } from "./store/user.actions";
import { tap } from "rxjs";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  public isIframe = false;

  constructor(
    private router: Router,
    private store: Store,
    private b2CAuthService: B2CAuthService,
  ) {}

  ngOnInit(): void {
    this.store.dispatch([new CheckScreen(), new SetUserPermissions()]);

    this.isIframe = window !== window.parent && !window.opener;

    this.b2CAuthService.interactionStatusNone().subscribe();

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      tap(() => this.store.dispatch(new SetUserPermissions())),
      map(() => this.router.routerState.root),
      map(route => {
        while (route.firstChild) route = route.firstChild;
        return route;
      }),
      mergeMap(route => route.data)
    ).subscribe(data => {
      const isOrganizationArea = data?.['isOrganizationArea'] || false;
      const isAgencyArea = data?.['isAgencyArea'] || false;
      this.store.dispatch(new SetIsOrganizationAgencyArea({ isOrganizationArea, isAgencyArea }));
    });
  }
}
