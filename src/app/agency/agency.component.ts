import { Component } from '@angular/core';
import { Store } from '@ngxs/store';

import { SetSidebarMenu } from '../store/app.actions';
import { AGENCY_SIDEBAR_MENU } from './agency-menu.config';

@Component({
  selector: 'app-agency',
  template: '<router-outlet></router-outlet>'
})
export class AgencyComponent  {
  constructor(private store: Store) {
    store.dispatch(new SetSidebarMenu(AGENCY_SIDEBAR_MENU));
  }
}
