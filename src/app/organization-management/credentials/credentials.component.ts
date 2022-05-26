import { Component, OnDestroy, ViewChild } from '@angular/core';
import { TabComponent } from '@syncfusion/ej2-angular-navigations';
import { Select, Store } from '@ngxs/store';
import { ShowSideDialog } from '../../store/app.actions';
import { Router } from '@angular/router';
import { CredentialsState } from '../store/credentials.state';
import { Observable, Subject, takeUntil } from 'rxjs';
import { CredentialSetupFilter } from '@shared/models/credential-setup-filter.model';
import { CredentialsNavigationTabs } from '@shared/enums/credentials-navigation-tabs';
import { SetNavigationTab } from '../store/credentials.actions';

@Component({
  selector: 'app-credentials',
  templateUrl: './credentials.component.html',
  styleUrls: ['./credentials.component.scss']
})
export class CredentialsComponent implements OnDestroy {
  @ViewChild('navigationTabs') navigationTabs: TabComponent;

  @Select(CredentialsState.activeTab)
  activeTab$: Observable<number>;

  @Select(CredentialsState.setupFilter)
  setupFilter$: Observable<CredentialSetupFilter>;

  public isToolButtonsShown = true;

  private unsubscribe$: Subject<void> = new Subject();

  constructor(private router: Router,
              private store: Store) {}

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.store.dispatch(new SetNavigationTab(CredentialsNavigationTabs.CredentialsList));
  }

  public onAddCredentialClick(): void {
    this.store.dispatch(new ShowSideDialog(true));
  }

  public onTabSelected(selectedTab: any): void {
    if (selectedTab.selectedIndex === CredentialsNavigationTabs['Setup']) {
      this.navigationTabs.selectedItem = CredentialsNavigationTabs['Setup'];
      this.router.navigateByUrl('admin/organization-management/credentials/setup');
    } else {
      this.navigationTabs.selectedItem = CredentialsNavigationTabs['CredentialsList'];
      this.router.navigateByUrl('admin/organization-management/credentials/list');
    }

    this.isToolButtonsShown = selectedTab.selectedIndex !== CredentialsNavigationTabs.Setup;
    this.store.dispatch(new ShowSideDialog(false));
  }

  public onTabsCreated(): void {
    this.activeTab$.pipe(takeUntil(this.unsubscribe$))
      .subscribe(activeTab => this.onTabSelected({ selectedIndex: activeTab }));
  }
}
