import { Component, ViewChild } from '@angular/core';

import { TabComponent } from '@syncfusion/ej2-angular-navigations';
import { Store } from '@ngxs/store';

import {
  AbstractGridConfigurationComponent
} from '../../../../shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { SetHeaderState, ShowSideDialog } from '../../../../store/app.actions';

export enum CredentialsNavigationTabs {
  CredentialsList,
  Setup
}

@Component({
  selector: 'app-credentials',
  templateUrl: './credentials.component.html',
  styleUrls: ['./credentials.component.scss']
})
export class CredentialsComponent extends AbstractGridConfigurationComponent  {
  @ViewChild('navigationTabs') navigationTabs: TabComponent;
  isToolButtonsShown = true;

  isCredentialListActive = true;
  isCredentialSetupActive = false;

  constructor(private store: Store) {
    super();
  }

  onAddCredentialClick(): void {
    this.store.dispatch(new ShowSideDialog(true));
  }

  onTabSelected(selectedTab: any): void {
    this.isCredentialListActive = CredentialsNavigationTabs['CredentialsList'] === selectedTab.selectedIndex;
    this.isCredentialSetupActive = CredentialsNavigationTabs['Setup'] === selectedTab.selectedIndex;
    this.isToolButtonsShown = selectedTab.selectedIndex !== CredentialsNavigationTabs.Setup;
    this.store.dispatch(new ShowSideDialog(false));
  }
}
