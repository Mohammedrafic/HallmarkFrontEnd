import { Component, OnInit } from '@angular/core';

import { Store } from '@ngxs/store';
import { SetHeaderState } from '../store/app.actions';
import { ORG_SETTINGS } from './organization-management-menu.config';

@Component({
  selector: 'app-organization-management',
  templateUrl: './organization-management.component.html',
  styleUrls: ['./organization-management.component.scss']
})
export class OrganizationManagementComponent implements OnInit {
  public sideMenuConfig = ORG_SETTINGS;


  constructor(private store: Store) {
    store.dispatch(new SetHeaderState({ title: 'Settings', iconName: '' }));
  }

  ngOnInit(): void {
  }
}
