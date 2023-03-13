import { Component, Input, Inject, ChangeDetectionStrategy } from '@angular/core';
import { DashboardService } from '../../services/dashboard.service';
import { GlobalWindow } from '@core/tokens';
import { AgencyPositionModel } from '../../models/agency-position.model';
import { Store } from '@ngxs/store';
import { AbstractPermissionGrid } from '@shared/helpers/permissions/abstract-permission-grid';
import { SetLastSelectedOrganizationAgencyId } from 'src/app/store/user.actions';
import { UserState } from '../../../store/user.state';
import { BusinessUnitType } from '../../../shared/enums/business-unit-type';
import { SetPreservedFilters } from 'src/app/store/preserved-filters.actions';
import { FilterService } from '@shared/services/filter.service';

@Component({
  selector: 'app-agencyposition-widget',
  templateUrl: './agencyposition-widget.component.html',
  styleUrls: ['./agencyposition-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgencypositionWidgetComponent extends AbstractPermissionGrid {
  @Input() public isLoading: boolean;
  @Input() public isDarkTheme: boolean | false;
  @Input() public description: string;
  @Input() public chartData: AgencyPositionModel | undefined;
  public agencydata:any;
  private mousePosition = {
    x: 0,
    y: 0,
  };

  constructor(private readonly dashboardService: DashboardService,protected override store: Store,
              @Inject(GlobalWindow) protected readonly globalWindow : WindowProxy & typeof globalThis,
              public filterservice : FilterService) {
                super(store);
              }

  ngOnChanges():void {
    this.agencydata = this.chartData;
  }
  
  public defineMousePosition($event: MouseEvent): void {
    this.mousePosition.x = $event.screenX;
    this.mousePosition.y = $event.screenY;
  }

  public toSourceContent(OrgId:number, condition:string): void {
    const orderStatus = OrgId;
    const user = this.store.selectSnapshot(UserState.user);
    if (user?.businessUnitType != null && user?.businessUnitType == BusinessUnitType.Agency) {
      this.dashboardService.redirectToUrlWithAgencyposition('agency/order-management',orderStatus,condition);
    } else {
      this.store.dispatch(
        new SetLastSelectedOrganizationAgencyId({
          lastSelectedAgencyId: null,
          lastSelectedOrganizationId: OrgId
        })
      );
      this.dashboardService.redirectToUrl('client/order-management');
    }


  }
}
