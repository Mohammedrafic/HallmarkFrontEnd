import { Component, OnInit, ChangeDetectionStrategy,Input } from '@angular/core';
import { DASHBOARD_FILTER_STATE } from '@shared/constants';
import { SetLastSelectedOrganizationAgencyId } from 'src/app/store/user.actions';
import { DashboardService } from '../../services/dashboard.service';
import { Store } from '@ngxs/store';

@Component({
  selector: 'app-orders-pending-custom-status',
  templateUrl: './orders-pending-custom-status.component.html',
  styleUrls: ['./orders-pending-custom-status.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrdersPendingCustomStatusComponent implements OnInit {
  @Input() public chartData: any ;
  @Input() isDarkTheme: boolean | false;
  @Input() description: string;
  @Input() public isLoading: boolean;
  @Input() widgetData: any;
  private mousePosition = {
    x: 0,
    y: 0,
  };

  constructor(private readonly dashboardService: DashboardService, private store: Store) { }

  ngOnInit(): void { }

  public defineMousePosition($event: MouseEvent): void {
    this.mousePosition.x = $event.screenX;
    this.mousePosition.y = $event.screenY;
  }

  public redirectToUrl(event: MouseEvent,status:string){
    let lastSelectedOrganizationId = window.localStorage.getItem("lastSelectedOrganizationId");
    let filteredList = JSON.parse(window.localStorage.getItem(DASHBOARD_FILTER_STATE) as string) || [];
    if (filteredList.length > 0) {
      let organizations = filteredList.filter((ele: any) => ele.column == "organizationIds").sort((a: any, b: any) => a.value - b.value);
      if (organizations.length > 0 && organizations[0].value != lastSelectedOrganizationId) {
        this.store.dispatch(
          new SetLastSelectedOrganizationAgencyId({
            lastSelectedAgencyId: null,
            lastSelectedOrganizationId: organizations[0].value
          })
        );
      }
    }
    if(status){
      window.localStorage.setItem("orderTypeFromDashboard", JSON.stringify(true))
      this.dashboardService.redirectToUrlWithActivePositions('client/order-management', undefined, "Custom-"+ status);
    }
  }

}
