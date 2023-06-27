import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Store } from '@ngxs/store';

import { SetNavigationTab } from '@organization-management/store/credentials.actions';
import { CredentialsNavigationTabs } from '@shared/enums/credentials-navigation-tabs';
import { ShowSideDialog } from 'src/app/store/app.actions';

@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.scss'],
})
export class GroupComponent {
  constructor(private store: Store,
              private router: Router,
              private route: ActivatedRoute) { }

  onBackButtonClick(): void {
    this.store.dispatch(new SetNavigationTab(CredentialsNavigationTabs.Setup));
    this.router.navigate(['..'], { relativeTo: this.route});
  }

  onAddGroupClick(): void {
    this.store.dispatch(new ShowSideDialog(true));
  }
}
