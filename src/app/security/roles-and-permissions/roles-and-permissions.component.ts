import { Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';

import { SetHeaderState } from 'src/app/store/app.actions';

@Component({
  selector: 'app-roles-and-permissions',
  templateUrl: './roles-and-permissions.component.html',
  styleUrls: ['./roles-and-permissions.component.scss']
})
export class RolesAndPermissionsComponent {

  constructor(private store: Store) {
    this.store.dispatch(new SetHeaderState({ title: 'Roles And Permissions', iconName: 'clock' }));

  }

}
