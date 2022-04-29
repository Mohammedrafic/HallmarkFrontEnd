import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Store } from '@ngxs/store';
import { ListBoxChangeEventArgs, SelectionSettingsModel } from '@syncfusion/ej2-angular-dropdowns';

import { SetHeaderState } from '../../../store/app.actions';
import { ORG_SETTINGS } from '../../admin-menu.config';

@Component({
  selector: 'app-organization-management-content',
  templateUrl: './organization-management-content.component.html',
  styleUrls: ['./organization-management-content.component.scss']
})
export class OrganizationManagementContentComponent  {
  public sideMenuConfig = ORG_SETTINGS;

  constructor(private store: Store,
              private router: Router,
              private route: ActivatedRoute) {
    store.dispatch(new SetHeaderState({ title: 'Organization Management' }));
  }
  
}
