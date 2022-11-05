import { Component, OnInit } from '@angular/core';

import { Store } from '@ngxs/store';
import { SetHeaderState } from 'src/app/store/app.actions';
import { MASTER_DATA_CONFIG } from '../admin-menu.config';
import { AbstractPermission } from '@shared/helpers/permissions';
import { MenuSettings } from '@shared/models';

@Component({
  selector: 'app-master-data-content',
  templateUrl: './master-data-content.component.html',
  styleUrls: ['./master-data-content.component.scss']
})
export class MasterDataContentComponent extends AbstractPermission implements OnInit {
  public sideMenuConfig: MenuSettings[];

  constructor(protected override store: Store) {
    super(store);
    store.dispatch(new SetHeaderState({ title: 'Master Data', iconName: 'user' }));
  }

  override ngOnInit(): void {
    super.ngOnInit();

    this.sideMenuConfig = this.checkValidPermissions(MASTER_DATA_CONFIG);
  }
}
