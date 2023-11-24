import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';

import { TabComponent } from '@syncfusion/ej2-angular-navigations';

import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { MasterCredentialsTypesComponent } from './master-credentials-types/master-credentials-types.component';
import { Actions, ofActionDispatched, Store } from '@ngxs/store';
import { SetCredentialsFilterCount, ShowExportCredentialListDialog } from '@organization-management/store/credentials.actions';
import { map } from 'rxjs';
import { ShowExportDialog, ShowFilterDialog, ShowSideDialog } from 'src/app/store/app.actions';
import { ExportedFileType } from '@shared/enums/exported-file-type';
import { AbstractPermissionGrid } from '@shared/helpers/permissions';

export enum CredentialsNavigationTabs {
  Types,
  List,
}

@Component({
  selector: 'app-master-credentials',
  templateUrl: './master-credentials.component.html',
  styleUrls: ['./master-credentials.component.scss'],
})
export class MasterCredentialsComponent extends AbstractPermissionGrid {
  @ViewChild('navigationTabs') navigationTabs: TabComponent;
  @ViewChild(RouterOutlet) outlet: RouterOutlet;

  public isTypeTabActive = true;
  public filteredItemsCount$ = this.actions$.pipe(
    ofActionDispatched(SetCredentialsFilterCount),
    map((count) => count.payload)
  );

  constructor(
    private router: Router, 
    private route: ActivatedRoute, 
    private actions$: Actions, 
    protected override store: Store,
  ) {
    super(store);
  }

  public onTabSelected(selectedTab: { selectedIndex: CredentialsNavigationTabs }): void {
    if (selectedTab.selectedIndex === CredentialsNavigationTabs.Types) {
      this.navigationTabs.selectedItem = CredentialsNavigationTabs.Types;
      this.router.navigate(['types'], { relativeTo: this.route });
    } else {
      this.navigationTabs.selectedItem = CredentialsNavigationTabs.List;
      this.router.navigate(['list'], { relativeTo: this.route });
    }

    this.isTypeTabActive = selectedTab.selectedIndex === CredentialsNavigationTabs.Types;
  }

  public onTabsCreated(): void {
    this.onTabSelected({ selectedIndex: CredentialsNavigationTabs.Types });
  }

  public onAddCredentialTypeClick(): void {
    const masterCredentialsTypesComponent = this.outlet.component as MasterCredentialsTypesComponent;
    masterCredentialsTypesComponent.onAddCredentialTypeClick();
  }

  public onAddCredentialClick(): void {
    this.store.dispatch(new ShowSideDialog(true));
  }

  public exportSelectedTypes(event: unknown): void {
    const masterCredentialsTypesComponent = this.outlet.component as AbstractGridConfigurationComponent;
    masterCredentialsTypesComponent.exportSelected(event);
  }

  public showFilters(): void {
    this.store.dispatch(new ShowFilterDialog(true));
  }

  public override customExport(): void {
    this.store.dispatch(new ShowExportDialog(true));
  }

  public override defaultExport(fileType: ExportedFileType): void {
    this.store.dispatch(new ShowExportCredentialListDialog(fileType));
  }
}

