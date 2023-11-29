import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';

import { Store } from '@ngxs/store';
import { SetHeaderState } from 'src/app/store/app.actions';
import { MASTER_DATA_CONFIG } from '../admin-menu.config';
import { AbstractPermission } from '@shared/helpers/permissions';
import { MenuSettings } from '@shared/models';
import { Permission } from '@core/interface';
import { takeUntil } from 'rxjs';

@Component({
  selector: 'app-master-data-content',
  templateUrl: './master-data-content.component.html',
  styleUrls: ['./master-data-content.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MasterDataContentComponent extends AbstractPermission implements OnInit {
  public sideMenuConfig: MenuSettings[] = [];

  constructor(
    protected override store: Store, 
    private cd: ChangeDetectorRef, 
  ) {
    super(store);
    store.dispatch(new SetHeaderState({ title: 'Master Data', iconName: 'server' }));
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.watchForPermissions();
  }

  private watchForPermissions(): void {
    this.getPermissionStream().pipe(
      takeUntil(this.componentDestroy())
    ).subscribe((permissions: Permission) => {
      this.userPermission = permissions;
      this.setMenuConfig();
    });
  }

  private setMenuConfig(): void {
    this.sideMenuConfig = this.checkValidPermissions(MASTER_DATA_CONFIG);
    this.cd.detectChanges();
  }
}
