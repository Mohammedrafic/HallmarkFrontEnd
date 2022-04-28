import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Store } from '@ngxs/store';
import { ListBoxChangeEventArgs, SelectionSettingsModel } from '@syncfusion/ej2-angular-dropdowns';

import { SetHeaderState } from '../../../store/app.actions';

@Component({
  selector: 'app-organization-management-content',
  templateUrl: './organization-management-content.component.html',
  styleUrls: ['./organization-management-content.component.scss']
})
export class OrganizationManagementContentComponent  {
  additionalSectionMenu: { [key: string]: Object }[] = [
    { text: 'Departments', id: 1, route: 'admin/organization-management/departments' },
    { text: 'Locations', id: 2, route: 'admin/organization-management/locations' }
  ];
  selectionSettings: SelectionSettingsModel = { mode: 'Single' };

  constructor(private store: Store,
              private router: Router,
              private route: ActivatedRoute) {
    store.dispatch(new SetHeaderState({ title: 'Organization Management' }));
  }

  goToSection(event: ListBoxChangeEventArgs ): void {
    this.router.navigate(['admin/organization-management/departments']);
  }
}
