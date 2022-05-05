import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Store } from '@ngxs/store';
import { SetHeaderState } from 'src/app/store/app.actions';
import { MASTER_DATA_CONFIG } from '../admin-menu.config';

@Component({
  selector: 'app-master-data-content',
  templateUrl: './master-data-content.component.html',
  styleUrls: ['./master-data-content.component.scss']
})
export class MasterDataContentComponent  {

  constructor(private store: Store,
              private router: Router,
              private route: ActivatedRoute) {
    store.dispatch(new SetHeaderState({ title: 'Master Data', iconName: 'user' }));
  }

  public sideMenuConfig = MASTER_DATA_CONFIG;


}
