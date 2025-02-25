import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { combineLatest, filter, Observable, Subject, takeUntil } from 'rxjs';
import { SelectEventArgs } from '@syncfusion/ej2-angular-navigations';
import { Actions, ofActionDispatched, Select, Store } from '@ngxs/store';

import { CredentialsNavigationTabs } from '@shared/enums/credentials-navigation-tabs';
import { ExportedFileType } from '@shared/enums/exported-file-type';
import { AbstractPermissionGrid } from "@shared/helpers/permissions";
import { COMPONENT_PERMISSIONS } from '@organization-management/credentials/constants';
import { CredentialPermissions } from '@organization-management/credentials/interfaces';
import { ShowExportDialog, ShowFilterDialog, ShowSideDialog } from '../../store/app.actions';
import { PermissionService } from 'src/app/security/services/permission.service';
import { GetOrganizationStructure } from '../../store/user.actions';
import {
  SetCredentialsFilterCount,
  ShowExportCredentialListDialog,
} from '../store/credentials.actions';
import { CredentialFiltersService, CredentialListService } from '@shared/components/credentials-list/services';
import { OrganizationManagementState } from '@organization-management/store/organization-management.state';
import { CredentialPage } from '@shared/models/credential.model';
import { CredentialSkillGroupPage } from '@shared/models/skill-group.model';
import {
  GetCredential,
  GetCredentialForSettings,
  GetCredentialTypes,
} from '@organization-management/store/organization-management.actions';

@Component({
  selector: 'app-credentials',
  templateUrl: './credentials.component.html',
  styleUrls: ['./credentials.component.scss'],
})
export class CredentialsComponent extends AbstractPermissionGrid implements OnInit, OnDestroy {
  @Select(OrganizationManagementState.credentialSettingPage)
  private credentialsPage$: Observable<CredentialPage>;
  @Select(OrganizationManagementState.skillGroups)
  private skillGroups$: Observable<CredentialSkillGroupPage>;

  public readonly tabs = CredentialsNavigationTabs;
  public activeTab: CredentialsNavigationTabs = CredentialsNavigationTabs.Setup;
  public showCredentialMessage = true;
  public filteredItemsCount = 0;
  public permissions$: Observable<CredentialPermissions>;

  private unsubscribe$: Subject<void> = new Subject();

  constructor(
    private route: ActivatedRoute,
    protected override store: Store,
    private actions$: Actions,
    private permissionService: PermissionService,
    private credentialListService: CredentialListService,
    private cdr: ChangeDetectorRef,
    private credentialFiltersService: CredentialFiltersService
  ) {
    super(store);

    this.watchForCredentialsFilterCount();
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.getStructureAndPermission();
    this.watchForSkillGroupAndCredentials();
    this.getCredentialForPage();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public override customExport(): void {
    this.store.dispatch(new ShowExportDialog(true));
  }

  public override defaultExport(fileType: ExportedFileType): void {
    if (this.activeTab === CredentialsNavigationTabs.CredentialsList) {
      this.store.dispatch(new ShowExportCredentialListDialog(fileType));
    }
  }

  public showCredentialMappingModal(): void {
    this.store.dispatch([
      new GetCredential(),
      new GetCredentialTypes(),
      new ShowSideDialog(true),
    ]);
  }

  public showCredentialDialogs(): void {
    this.store.dispatch(new ShowSideDialog(true));
  }

  public showFilterDialog(): void {
    this.store.dispatch(new ShowFilterDialog(true));
  }

  public selectTab(selectedTab: SelectEventArgs): void {
    this.activeTab = selectedTab.selectedIndex;
    this.store.dispatch(new ShowSideDialog(false));
  }

  public showAssignCredential(): void {
    this.credentialListService.setAssignCredentialModalState(true);
  }

  private getStructureAndPermission(): void {
    this.store.dispatch(new GetOrganizationStructure());
    this.permissions$ = this.permissionService.checkPermisionFor<CredentialPermissions>(COMPONENT_PERMISSIONS);
  }

  private watchForSkillGroupAndCredentials(): void {
    combineLatest([
      this.credentialsPage$,
      this.skillGroups$,
    ]).pipe(
      filter(() => this.activeTab === CredentialsNavigationTabs.Setup),
      takeUntil(this.unsubscribe$),
    ).subscribe(([credential, skillGroup]) => {
      this.showCredentialMessage = !credential?.items?.length || !skillGroup?.items?.length;
      this.cdr.markForCheck();
    });
  }

  private watchForCredentialsFilterCount(): void {
    this.actions$.pipe(
      ofActionDispatched(SetCredentialsFilterCount),
      takeUntil(this.unsubscribe$)
    ).subscribe((count) => {
      this.filteredItemsCount = count.payload;
    });
  }

  private getCredentialForPage(): void {
    this.store.dispatch( new GetCredentialForSettings(this.credentialFiltersService.filtersState));
  }
}

