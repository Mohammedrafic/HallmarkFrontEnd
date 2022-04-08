import { Component } from '@angular/core';
import { Store } from '@ngxs/store';
import { SetSidebarMenu } from '../store/app.actions';
import { CLIENT_SIDEBAR_MENU } from './client-menu.config';

@Component({
  selector: 'app-client',
  template: '<router-outlet></router-outlet>',
  styleUrls: ['./client.component.scss']
})
export class ClientComponent  {
  constructor(private store: Store) {
    store.dispatch(new SetSidebarMenu(CLIENT_SIDEBAR_MENU));
  }
}
