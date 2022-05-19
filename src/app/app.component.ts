import { Component } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';

import { Store } from '@ngxs/store';

import { ORGANIZATION_URL_AREAS_REG_EXPS, AGENCY_URL_AREAS_REG_EXPS } from '@shared/constants';
import { SetIsOrganizationAgencyArea } from './store/app.actions';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(private router: Router, private store: Store) {
    this.router.events.pipe().subscribe((event: any) => {
      if (event instanceof NavigationStart) {
        const isOrganizationArea = ORGANIZATION_URL_AREAS_REG_EXPS.some(regexp => regexp.test(event.url));
        const isAgencyArea = AGENCY_URL_AREAS_REG_EXPS.some(regexp => regexp.test(event.url));

        this.store.dispatch(new SetIsOrganizationAgencyArea({ isOrganizationArea, isAgencyArea }));
      }
    });
  }
}
