import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

import { Store } from '@ngxs/store';
import { filter, map, mergeMap } from 'rxjs/operators';

import { SetIsOrganizationAgencyArea } from './store/app.actions';
import { GetOrganizationStructure } from './store/user.actions';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(private router: Router, private store: Store) {
    router.events.pipe(
      filter(event => event instanceof NavigationEnd),
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
      if (isOrganizationArea) {
        this.store.dispatch(new GetOrganizationStructure());
      }
    });
  }
}
