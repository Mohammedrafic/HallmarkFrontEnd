import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';

import { ColDef } from '@ag-grid-community/core';
import { Select, Store } from '@ngxs/store';
import { Observable, Subject, takeUntil, takeWhile } from 'rxjs';
import { DefaultUserGridColDef, SideBarConfig } from 'src/app/security/user-list/user-grid/user-grid.constant';
import { AppState } from 'src/app/store/app.state';
import { ServerSideRowModelModule } from '@ag-grid-enterprise/server-side-row-model';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { ButtonRendererComponent } from '@shared/components/button/button-renderer/button-renderer.component';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { CustomNoRowsOverlayComponent } from '@shared/components/overlay/custom-no-rows-overlay/custom-no-rows-overlay.component';
import { GRID_CONFIG } from '@shared/constants';
import { GetOrgInterfacePage } from 'src/app/security/store/security.actions';
import { SecurityState } from 'src/app/security/store/security.state';
import { OrgInterface, OrgInterfacePage } from '@shared/models/org-interface.model';
import { ToggleSwitchComponent } from '@admin/alerts/toggle-switch/toggle-switch.component';
import { SetHeaderState } from 'src/app/store/app.actions';
import { Organisation } from '@shared/models/visibility-settings.model';
import { uniqBy } from 'lodash';
import { UserState } from 'src/app/store/user.state';

@Component({
  selector: 'app-organization-integrations',
  templateUrl: './organization-integrations.component.html',
  styleUrls: ['./organization-integrations.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationIntegrationsComponent extends AbstractGridConfigurationComponent implements OnInit, OnDestroy {

  constructor(private store: Store,) {
    super();
    this.store.dispatch(new SetHeaderState({ title: 'Organization Integrations', iconName: 'file-text' }));

  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
  }

}
