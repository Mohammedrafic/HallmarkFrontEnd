import { Component } from '@angular/core';
import { Store } from '@ngxs/store';
import { SetSidebarMenu } from '../store/app.actions';
import { ADMIN_SIDEBAR_MENU } from './admin-menu.config';

@Component({
  selector: 'app-admin',
  template: '<router-outlet></router-outlet>',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent  {
  constructor(private store: Store) {
    store.dispatch(new SetSidebarMenu(ADMIN_SIDEBAR_MENU));
  }
}
