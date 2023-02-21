import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { TabComponent } from '@syncfusion/ej2-angular-navigations';
import { Actions, ofActionDispatched, Select, Store } from '@ngxs/store';
import { ShowExportDialog, ShowFilterDialog, ShowSideDialog } from '../../store/app.actions';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { CredentialsState } from '../store/credentials.state';
import { Observable, Subject, takeUntil } from 'rxjs';
import { CredentialSetupFilter } from '@shared/models/credential-setup-filter.model';
import { CredentialsNavigationTabs } from '@shared/enums/credentials-navigation-tabs';
import {
  SetCredentialsFilterCount,
  SetNavigationTab,
  ShowExportCredentialListDialog,
} from '../store/credentials.actions';
import { ExportedFileType } from '@shared/enums/exported-file-type';
import { GetOrganizationStructure } from '../../store/user.actions';
import { CredentialsListComponent } from '@shared/components/credentials-list/credentials-list.component';
import { PermissionService } from 'src/app/security/services/permission.service';
import { PermissionTypes } from '@shared/enums/permissions-types.enum';
import { AbstractPermissionGrid } from "@shared/helpers/permissions";

type ComponentPermissionTitle = 'canAddManual' | 'canManageOrganizationCredential';
type Permisions = Record<ComponentPermissionTitle, boolean>;

const COMPONENT_PERMISSIONS: Record<ComponentPermissionTitle, PermissionTypes> = {
  canAddManual: PermissionTypes.ManuallyAddCredential,
  canManageOrganizationCredential: PermissionTypes.ManageOrganizationCredential
};

@Component({
  selector: 'app-credentials',
  templateUrl: './credentials.component.html',
  styleUrls: ['./credentials.component.scss'],
})
export class CredentialsComponent extends AbstractPermissionGrid implements OnInit, OnDestroy {
  @ViewChild('navigationTabs') navigationTabs: TabComponent;
  @ViewChild(RouterOutlet) outlet: RouterOutlet;

  @Select(CredentialsState.activeTab)
  activeTab$: Observable<number>;

  @Select(CredentialsState.setupFilter)
  setupFilter$: Observable<CredentialSetupFilter>;

  public isCredentialListToolButtonsShown = true;
  public isCredentialListActive = true;
  public filteredItemsCount = 0;
  public permissions$: Observable<Permisions>;

  private unsubscribe$: Subject<void> = new Subject();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    protected override store: Store,
    private actions$: Actions,
    private permissionService: PermissionService
  ) {
    super(store);
    actions$
      .pipe(ofActionDispatched(SetCredentialsFilterCount))
      .subscribe((count) => (this.filteredItemsCount = count.payload));
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.store.dispatch(new GetOrganizationStructure());
    this.permissions$ = this.permissionService.checkPermisionFor<Permisions>(COMPONENT_PERMISSIONS);
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
    this.router.navigate(['groups-setup'], { relativeTo: this.route });
  }

  public onAssignCredentialClick(): void {
    const credentialListComponent = this.outlet.component as CredentialsListComponent;
    credentialListComponent.showAssignSiderbar();
  }
}

