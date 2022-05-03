import { Component, OnInit, ViewChild } from '@angular/core';

import { TabComponent } from '@syncfusion/ej2-angular-navigations';
import { Store } from '@ngxs/store';

import { ShowSideDialog } from '../../../store/app.actions';

export enum CredentialsNavigationTabs {
  Credential = 'Credential',
  CredentialsTypes = 'Types'
}

@Component({
  selector: 'app-master-credentials',
  templateUrl: './master-credentials.component.html',
  styleUrls: ['./master-credentials.component.scss']
})
export class MasterCredentialsComponent implements OnInit {
  @ViewChild('navigationTabs') navigationTabs: TabComponent;
  isToolButtonsShown = true;

  isCredentialActive = true;
  isCredentialsTypesActive = false;

  constructor(private store: Store) { }

  ngOnInit(): void {
  }

  onAddCredentialClick(): void {
    this.store.dispatch(new ShowSideDialog(true));
  }

  onTabSelected(selectedTab: any): void {
    this.isCredentialActive = CredentialsNavigationTabs['Credential'] === selectedTab.selectedIndex;
    this.isCredentialsTypesActive = CredentialsNavigationTabs['CredentialsTypes'] === selectedTab.selectedIndex;
    this.isToolButtonsShown = selectedTab.selectedIndex !== CredentialsNavigationTabs.CredentialsTypes;
    this.store.dispatch(new ShowSideDialog(false));
  }
}
