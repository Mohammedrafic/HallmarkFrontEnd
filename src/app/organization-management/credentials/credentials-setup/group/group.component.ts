import { Component } from '@angular/core';
import { ShowSideDialog } from '../../../../store/app.actions';
import { Store } from '@ngxs/store';
import { ActivatedRoute, Router } from '@angular/router';
import { SetNavigationTab } from '../../../store/credentials.actions';
import { CredentialsNavigationTabs } from '@shared/enums/credentials-navigation-tabs';

@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.scss']
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
