import { ChangeDetectorRef, Component, OnInit } from '@angular/core';

import { Store } from '@ngxs/store';
import { SelectEventArgs } from '@syncfusion/ej2-angular-navigations';

import { TakeUntilDestroy } from '@core/decorators';
import { AbstractPermissionGrid } from "@shared/helpers/permissions";
import { Observable } from 'rxjs';
import { OrientationTab } from './enums/orientation-type.enum';

@Component({
  selector: 'app-orientation',
  templateUrl: './orientation.component.html',
  styleUrls: ['./orientation.component.scss'],
})
@TakeUntilDestroy
export class OrientationComponent extends AbstractPermissionGrid implements OnInit {
  public readonly orientationTab = OrientationTab;
  public selectedTab: OrientationTab = OrientationTab.Setup;

  protected componentDestroy: () => Observable<unknown>;

  constructor(
    protected override store: Store,
    private cd: ChangeDetectorRef,
  ) {
    super(store);
  }

  override ngOnInit(): void {
    super.ngOnInit();
  }

  selectTab(selectedTab: SelectEventArgs): void {
    this.selectedTab = selectedTab.selectedIndex;
    this.cd.markForCheck();
  }
}
