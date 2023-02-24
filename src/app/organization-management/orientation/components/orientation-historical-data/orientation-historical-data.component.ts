import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { AbstractPermissionGrid } from '@shared/helpers/permissions/abstract-permission-grid';

@Component({
  selector: 'app-orientation-historical-data',
  templateUrl: './orientation-historical-data.component.html',
  styleUrls: ['./orientation-historical-data.component.scss'],
})
export class OrientationHistoricalDataComponent extends AbstractPermissionGrid implements OnInit {
  
  constructor(
    protected override store: Store,
  ) {
    super(store);
  }
  
}
