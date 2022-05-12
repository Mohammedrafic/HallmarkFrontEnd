import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';

import { TabComponent } from '@syncfusion/ej2-angular-navigations';
import { Store } from '@ngxs/store';

import { ShowSideDialog } from '../../../../store/app.actions';
import { UrlService } from '../../../../shared/services/url.service';

export enum CredentialsNavigationTabs {
  CredentialsList,
  Setup
}

@Component({
  selector: 'app-credentials',
  templateUrl: './credentials.component.html',
  styleUrls: ['./credentials.component.scss']
})
export class CredentialsComponent implements AfterViewInit {
  @ViewChild('navigationTabs') navigationTabs: TabComponent;
  isToolButtonsShown = true;

  isCredentialListActive = true;
  isCredentialSetupActive = false;

  private skillGroupPathName = 'admin/organization-management/credentials/groups-setup';

  constructor(private store: Store,
              private urlService: UrlService) {}

  onAddCredentialClick(): void {
    this.store.dispatch(new ShowSideDialog(true));
  }

  ngAfterViewInit() {
    this.urlService.previousUrl$.subscribe(url => {
      if (url === this.skillGroupPathName) {
        this.onTabSelected({ selectedIndex: CredentialsNavigationTabs.Setup });
      }
    });
  }

  onTabSelected(selectedTab: any): void {
    this.isCredentialListActive = CredentialsNavigationTabs['CredentialsList'] === selectedTab.selectedIndex;
    this.isCredentialSetupActive = CredentialsNavigationTabs['Setup'] === selectedTab.selectedIndex;
    this.isToolButtonsShown = selectedTab.selectedIndex !== CredentialsNavigationTabs.Setup;
    this.store.dispatch(new ShowSideDialog(false));
  }
}
