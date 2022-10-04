import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { TabComponent } from '@syncfusion/ej2-angular-navigations';
import { Actions, ofActionDispatched, Select, Store } from '@ngxs/store';
import { ShowExportDialog, ShowFilterDialog, ShowSideDialog } from '../../store/app.actions';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { CredentialsState } from '../store/credentials.state';
import { map, Observable, Subject, takeUntil } from 'rxjs';
import { CredentialSetupFilter } from '@shared/models/credential-setup-filter.model';
import { CredentialsNavigationTabs } from '@shared/enums/credentials-navigation-tabs';
import {
  SetCredentialsFilterCount,
  SetNavigationTab,
  ShowExportCredentialListDialog,
} from '../store/credentials.actions';
import { ExportedFileType } from '@shared/enums/exported-file-type';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { GetOrganizationStructure } from '../../store/user.actions';
import { CredentialsListComponent } from '@shared/components/credentials-list/credentials-list.component';
import { UserState } from 'src/app/store/user.state';
import { User } from '@shared/models/user.model';

@Component({
  selector: 'app-credentials',
  templateUrl: './credentials.component.html',
  styleUrls: ['./credentials.component.scss'],
})
export class CredentialsComponent extends AbstractGridConfigurationComponent implements OnInit, OnDestroy {
  @ViewChild('navigationTabs') navigationTabs: TabComponent;
  @ViewChild(RouterOutlet) outlet: RouterOutlet;

  @Select(CredentialsState.activeTab)
  activeTab$: Observable<number>;

  @Select(CredentialsState.setupFilter)
  setupFilter$: Observable<CredentialSetupFilter>;

  @Select(UserState.isHallmarkMspUser)
  isHallmarkMspUser$: Observable<boolean>;

  public isCredentialListToolButtonsShown = true;

  private unsubscribe$: Subject<void> = new Subject();

  public isCredentialListActive = true;

  public filteredItemsCount = 0;

  constructor(private router: Router, private route: ActivatedRoute, private store: Store, private actions$: Actions) {
    super();
    actions$
      .pipe(ofActionDispatched(SetCredentialsFilterCount))
      .subscribe((count) => (this.filteredItemsCount = count.payload));
  }

  ngOnInit(): void {
    this.store.dispatch(new GetOrganizationStructure());
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.store.dispatch(new SetNavigationTab(CredentialsNavigationTabs.Setup));
  }

  public showFilters(): void {
    this.store.dispatch(new ShowFilterDialog(true));
  }

  public override customExport(): void {
    this.store.dispatch(new ShowExportDialog(true));
  }

  public override defaultExport(fileType: ExportedFileType): void {
    if (this.isCredentialListActive) {
      this.store.dispatch(new ShowExportCredentialListDialog(fileType));
    }
  }

  public onAddCredentialClick(): void {
    this.store.dispatch(new ShowSideDialog(true));
  }

  public onTabSelected(selectedTab: any): void {
    if (selectedTab.selectedIndex === CredentialsNavigationTabs['Setup']) {
      this.navigationTabs.selectedItem = CredentialsNavigationTabs['Setup'];
      this.router.navigate(['setup'], { relativeTo: this.route });
      this.isCredentialListActive = false;
    } else {
      this.navigationTabs.selectedItem = CredentialsNavigationTabs['CredentialsList'];
      this.router.navigate(['list'], { relativeTo: this.route });
      this.isCredentialListActive = true;
    }

    this.isCredentialListToolButtonsShown = selectedTab.selectedIndex !== CredentialsNavigationTabs.Setup;
    this.store.dispatch(new ShowSideDialog(false));
  }

  public onTabsCreated(): void {
    this.activeTab$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((activeTab) => this.onTabSelected({ selectedIndex: activeTab }));
  }

  public onGroupsSetupClick(): void {
    this.router.navigateByUrl('admin/organization-management/credentials/groups-setup');
  }

  public onAssignCredentialClick(): void {
    const credentialListComponent = this.outlet.component as CredentialsListComponent;
    credentialListComponent.showAssignSiderbar();
  }
}
