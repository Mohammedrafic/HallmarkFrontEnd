import { Component, OnInit } from '@angular/core';

import { Store } from '@ngxs/store';
import { SelectEventArgs } from '@syncfusion/ej2-angular-navigations';

import { TakeUntilDestroy } from '@core/decorators';
import { AbstractPermissionGrid } from "@shared/helpers/permissions";
import { Observable } from 'rxjs';

@Component({
  selector: 'app-orientation',
  templateUrl: './orientation.component.html',
  styleUrls: ['./orientation.component.scss'],
})
@TakeUntilDestroy
export class OrientationComponent extends AbstractPermissionGrid implements OnInit {
  public selectedTab = 0; 

  protected componentDestroy: () => Observable<unknown>;

  constructor(
    protected override store: Store,
  ) {
    super(store);
  }

  override ngOnInit(): void {
    super.ngOnInit();
  }

  selectTab(selectedTab: SelectEventArgs): void {
    this.selectedTab = selectedTab.selectedIndex;
  }
}
