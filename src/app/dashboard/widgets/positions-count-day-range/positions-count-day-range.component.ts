import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { activePositionsLegendDisplayText } from '../../constants/active-positions-legend-palette';
import { PositionsCountByDayRangeDataset } from '../../models/active-positions-dto.model';
import { DASHBOARD_FILTER_STATE } from '@shared/constants';
import { Store } from '@ngxs/store';
import { SetLastSelectedOrganizationAgencyId } from 'src/app/store/user.actions';
import { OrderStatus } from '@shared/enums/order-management';
import { DashboardService } from '../../services/dashboard.service';
import { PositionTrendTypeEnum } from '../../enums/position-trend-type.enum';
import { CandidatStatus, InProgress } from '@shared/enums/applicant-status.enum';

@Component({
  selector: 'app-positions-count-day-range',
  templateUrl: './positions-count-day-range.component.html',
  styleUrls: ['./positions-count-day-range.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PositionsCountDayRangeComponent implements OnInit {

  @Input() public chartData: PositionsCountByDayRangeDataset | undefined ;
  @Input() isDarkTheme: boolean | false;
  @Input() description: string;
  @Input() public isLoading: boolean;

  private mousePosition = {
    x: 0,
    y: 0,
  };

  public readonly activePositionsLegend: typeof activePositionsLegendDisplayText = activePositionsLegendDisplayText;

  constructor(private store: Store,private readonly dashboardService: DashboardService) { }

  ngOnInit(): void {
  }

  public defineMousePosition($event: MouseEvent): void {
    this.mousePosition.x = $event.screenX;
    this.mousePosition.y = $event.screenY;
  }

  public navigateUrl(event: MouseEvent,status:string){
    let candidatesStatusDataSet:any = []
    let activeOrderStatus:any = []
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
    window.localStorage.setItem("orderTypeFromDashboard", JSON.stringify(true));
    if(OrderStatus[OrderStatus.Open] ===  status){
      this.dashboardService.redirectToUrlWithActivePositions('client/order-management', undefined, OrderStatus[OrderStatus.OrdersOpenPositions]);
    }
    else if(status === InProgress.IN_PROGRESS){
      candidatesStatusDataSet.push({"value":CandidatStatus.Applied});
      candidatesStatusDataSet.push({"value":CandidatStatus.Shortlisted});
      candidatesStatusDataSet.push({"value":CandidatStatus.CustomStatus});
    }
    else if(status === 'Pending'){
      candidatesStatusDataSet.push({"value":CandidatStatus.Offered});
    }
    else if(status === 'Accepted'){
      candidatesStatusDataSet.push({"value":CandidatStatus.Accepted});
    }
    else if(OrderStatus[OrderStatus.Filled] === status){
      activeOrderStatus.push({"value":OrderStatus.InProgress, "name": PositionTrendTypeEnum.IN_PROGRESS})
      window.localStorage.setItem("candidatesOrderStatusListFromDashboard",JSON.stringify(activeOrderStatus));
      candidatesStatusDataSet.push({"value":CandidatStatus.OnBoard});
    }
    if(status !=  OrderStatus[OrderStatus.Open]){
      window.localStorage.setItem("candidateStatusListFromDashboard",JSON.stringify(candidatesStatusDataSet));
      this.dashboardService.redirectToUrlWithActivePositions('client/order-management', undefined, activeOrderStatus.length>0 ? status:OrderStatus[OrderStatus.InProgress]);
    }
  }
}
