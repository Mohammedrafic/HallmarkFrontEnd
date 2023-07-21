import { Component, OnInit } from '@angular/core';

import { Store } from '@ngxs/store';
import { ORG_SETTINGS } from './agency-settings-menu.config';
import { AbstractPermission } from '@shared/helpers/permissions';
import { MenuSettings } from '@shared/models';
import { filter, takeUntil } from 'rxjs';
import { SetHeaderState } from 'src/app/store/app.actions';

@Component({
  selector: 'app-agency-settings',
  templateUrl: './agency-settings.component.html',
  styleUrls: ['./agency-settings.component.scss'],
})
export class AgencySettingsComponent extends AbstractPermission implements OnInit {
  public sideMenuConfig: MenuSettings[];

  private orgSettings = ORG_SETTINGS;

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
    const itemsWithoutPermissions = this.orgSettings.filter((item: MenuSettings) => !item.permissionKeys).length;

    this.getPermissionStream()
      .pipe(
        filter(() => this.sideMenuConfig.length <= itemsWithoutPermissions),
        takeUntil(this.componentDestroy())
      )
      .subscribe((permissions) => {
        this.userPermission = permissions;
        this.setMenuConfig();
      });
  }

  private setMenuConfig(): void {
    this.sideMenuConfig = this.checkValidPermissions(this.orgSettings);
  }
}
