import { Component } from '@angular/core';
import { ShowFilterDialog, ShowSideDialog } from '../../../../store/app.actions';
import { Store } from '@ngxs/store';
import { Router } from '@angular/router';
import { SetNavigationTab } from '../../../store/credentials.actions';
import { CredentialsNavigationTabs } from '@shared/enums/credentials-navigation-tabs';

export enum GroupNavigationTabs {
  GroupSetupTab,
  GroupMappingTab
}

@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.scss']
})
export class GroupComponent {
  public isGroupSetupTabActive = true;
  public isGroupMappingTabActive = false;

  constructor(private store: Store,
              private router: Router) { }

  onTabSelected(selectedTab: any): void {
    this.isGroupSetupTabActive = GroupNavigationTabs['GroupSetupTab'] === selectedTab.selectedIndex;
    this.isGroupMappingTabActive = GroupNavigationTabs['GroupMappingTab'] === selectedTab.selectedIndex;
    this.store.dispatch(new ShowSideDialog(false));
  }

  onBackButtonClick(): void {
    this.store.dispatch(new SetNavigationTab(CredentialsNavigationTabs.Setup));
    this.router.navigateByUrl('admin/organization-management/credentials/setup');
  }

  onOpenFormButtonClick(): void {
    this.store.dispatch(new ShowSideDialog(true));
  }

  onOpenFilterButtonClick(): void {
    this.store.dispatch(new ShowFilterDialog(true));
  }
}
