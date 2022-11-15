import { Component, OnInit } from '@angular/core';

import { Store } from '@ngxs/store';
import { SetHeaderState } from '../store/app.actions';
import { ORG_SETTINGS } from './organization-management-menu.config';
import { AbstractPermission } from '@shared/helpers/permissions';
import { MenuSettings } from '@shared/models';
import { Permission } from '@core/interface';
import { filter, takeUntil } from 'rxjs';

@Component({
  selector: 'app-organization-management',
  templateUrl: './organization-management.component.html',
  styleUrls: ['./organization-management.component.scss']
})
export class OrganizationManagementComponent extends AbstractPermission implements OnInit {
  public sideMenuConfig: MenuSettings[];

  constructor(protected override store: Store) {
    super(store);
    store.dispatch(new SetHeaderState({ title: 'Settings', iconName: 'settings' }));
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.setMenuConfig();
    this.watchForPermissions();
  }

  private watchForPermissions(): void {
    this.getPermissionStream().pipe(
      filter(() => this.sideMenuConfig.length <= 2),
      takeUntil(this.componentDestroy())
    ).subscribe((permissions: Permission) => {
        this.userPermission = permissions;
        this.setMenuConfig();
    });
  }

  private setMenuConfig(): void {
    this.sideMenuConfig = this.checkValidPermissions(ORG_SETTINGS);
  }
}
