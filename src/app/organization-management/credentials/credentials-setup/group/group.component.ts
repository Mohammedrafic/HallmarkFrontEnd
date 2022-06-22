import { Component } from '@angular/core';
import { ShowSideDialog } from '../../../../store/app.actions';
import { Store } from '@ngxs/store';
import { Router } from '@angular/router';
import { SetNavigationTab } from '../../../store/credentials.actions';
import { CredentialsNavigationTabs } from '@shared/enums/credentials-navigation-tabs';

@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.scss']
})
export class GroupComponent {
  constructor(private store: Store,
              private router: Router) { }

  onBackButtonClick(): void {
    this.store.dispatch(new SetNavigationTab(CredentialsNavigationTabs.Setup));
    this.router.navigateByUrl('admin/organization-management/credentials/setup');
  }

  onAddGroupClick(): void {
    this.store.dispatch(new ShowSideDialog(true));
  }
}
