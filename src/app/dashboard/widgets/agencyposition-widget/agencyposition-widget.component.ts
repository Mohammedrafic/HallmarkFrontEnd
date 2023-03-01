import { Component, Input, Inject, ChangeDetectionStrategy } from '@angular/core';
import { DashboardService } from '../../services/dashboard.service';
import { GlobalWindow } from '@core/tokens';
import { AgencyPositionModel } from '../../models/agency-position.model';
import { Store } from '@ngxs/store';
import { AbstractPermissionGrid } from '@shared/helpers/permissions/abstract-permission-grid';
import { SetLastSelectedOrganizationAgencyId } from 'src/app/store/user.actions';

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
              @Inject(GlobalWindow) protected readonly globalWindow : WindowProxy & typeof globalThis) {
                super(store);
              }

  ngOnChanges():void {
    this.agencydata = this.chartData;
  }
  
  public defineMousePosition($event: MouseEvent): void {
    this.mousePosition.x = $event.screenX;
    this.mousePosition.y = $event.screenY;
  }

  public toSourceContent(orgId:number): void {
    this.store.dispatch(
        new SetLastSelectedOrganizationAgencyId({
          lastSelectedAgencyId: null,
          lastSelectedOrganizationId: orgId,
        })
      );
    this.dashboardService.redirectToUrl('client/order-management/');
  }
}
