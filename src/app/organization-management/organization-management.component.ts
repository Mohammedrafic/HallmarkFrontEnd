import { Component, OnInit } from '@angular/core';

import { Select, Store } from '@ngxs/store';
import { SetHeaderState } from '../store/app.actions';
import { ORG_SETTINGS } from './organization-management-menu.config';
import { AbstractPermission } from '@shared/helpers/permissions';
import { MenuSettings } from '@shared/models';
import { filter, Observable, switchMap, takeUntil } from 'rxjs';
import { UserState } from '../store/user.state';
import { GetOrganizationById } from '@organization-management/store/organization-management.actions';
import { OrganizationManagementState } from '@organization-management/store/organization-management.state';
import { AppState } from '../store/app.state';

@Component({
  selector: 'app-organization-management',
  templateUrl: './organization-management.component.html',
  styleUrls: ['./organization-management.component.scss'],
})
export class OrganizationManagementComponent extends AbstractPermission implements OnInit {
  @Select(UserState.lastSelectedOrganizationId)
  private organizationId$: Observable<number>;

  public sideMenuConfig: MenuSettings[] = [];

  private orgSettings = ORG_SETTINGS;
  private isIRPFlagEnabled = false;
  private isIRPForOrganizationEnabled = false;

  constructor(
    protected override store: Store,
  ) {
    super(store);
    store.dispatch(new SetHeaderState({ title: 'Settings', iconName: 'settings' }));
    this.checkIRPFlag();
  }

  override ngOnInit(): void {
    super.ngOnInit();

    this.startOrgIdWatching();
  }

  private setMenuConfig(): void {
    const orgSettingsWithIRP =
      this.isIRPForOrganizationEnabled && this.isIRPFlagEnabled
        ? this.orgSettings
        : this.orgSettings.filter((item) => !item.isIRPOnly);
    this.sideMenuConfig = this.checkValidPermissions(orgSettingsWithIRP);
  }

  private startOrgIdWatching(): void {
    this.organizationId$
      .pipe(
        filter((id) => !!id),
        switchMap((id) => this.getOrganization(id)),
        switchMap(() => this.getPermissionStream()),
        takeUntil(this.componentDestroy())
      )
      .subscribe(() => {
        this.checkOrgPreferences();
        this.setMenuConfig();
      });
  }

  private getOrganization(businessUnitId: number): Observable<void> {
    const id = businessUnitId || (this.store.selectSnapshot(UserState.user)?.businessUnitId as number);

    return this.store.dispatch(new GetOrganizationById(id));
  }

  private checkOrgPreferences(): void {
    const { isIRPEnabled, isVMCEnabled } =
      this.store.selectSnapshot(OrganizationManagementState.organization)?.preferences || {};
    const isIRPOnly = this.isIRPFlagEnabled && !!(isIRPEnabled && !isVMCEnabled);
    this.isIRPForOrganizationEnabled = !!isIRPEnabled;

    this.setOrganizationSettings(isIRPOnly);
  }

  private setOrganizationSettings(isIRPOnly: boolean): void {
    if (isIRPOnly) {
      const filteredKeys = new Set([9]);
      this.orgSettings = this.orgSettings.filter((el) => !filteredKeys.has(el.id));
    } else {
      this.orgSettings = ORG_SETTINGS;
    }
  }

  private checkIRPFlag(): void {
    this.isIRPFlagEnabled = this.store.selectSnapshot(AppState.isIrpFlagEnabled);
  }
}
