import { ChangeDetectionStrategy, Component, Input,Inject } from '@angular/core';
import { Store } from '@ngxs/store';
import { BusinessUnitType } from '../../../shared/enums/business-unit-type';
import { UserState } from '../../../store/user.state';
import { CandidatesPositionDataModel } from '../../models/candidates-positions.model';
import { DashboardService } from '../../services/dashboard.service';
import { GlobalWindow } from '@core/tokens';
import { SetLastSelectedOrganizationAgencyId } from 'src/app/store/user.actions';
import { DASHBOARD_FILTER_STATE } from '@shared/constants';
import { PositionTrendTypeEnum } from '../../enums/position-trend-type.enum';
import { OrderStatus } from '@shared/enums/order-management';
import { CandidatStatus, InProgress } from '@shared/enums/applicant-status.enum';

@Component({
  selector: 'app-position-chart',
  templateUrl: './position-chart.component.html',
  styleUrls: ['./position-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PositionChartComponent {
  @Input() public isLoading: boolean;
  @Input() public chartData: CandidatesPositionDataModel | undefined;
  @Input() public description: string;
  @Input() public isDarkTheme: boolean;
  @Input() public isLTAOrderEnding: boolean = false;
  @Input() public slideBar: any = false;
  public ltaorderending:boolean = false;
  

  private mousePosition = {
    x: 0,
    y: 0,
  };

  constructor(private readonly dashboardService: DashboardService, private store: Store,
    @Inject(GlobalWindow) protected readonly globalWindow: WindowProxy & typeof globalThis, ) {}

  public defineMousePosition($event: MouseEvent): void {
    this.mousePosition.x = $event.screenX;
    this.mousePosition.y = $event.screenY;
  }

  public toSourceContent(event: MouseEvent): void {
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
    this.globalWindow.localStorage.setItem("ltaorderending", JSON.stringify(true));
    this.ltaorderending = JSON.parse(localStorage.getItem('ltaorderending') || 'false') as boolean;
    if (this.mousePosition.x === event.screenX && this.mousePosition.y === event.screenY) {
      const user = this.store.selectSnapshot(UserState.user);
      if (user?.businessUnitType != null && user?.businessUnitType == BusinessUnitType.Agency) {
        this.dashboardService.redirectToUrl('agency/order-management/', this.chartData === undefined ? 0 : this.chartData.orderStatus);

      } else {
        this.dashboardService.redirectToUrl('client/order-management/', this.chartData === undefined ? 0 : this.chartData.orderStatus);
      }
    }
  }

  public navigateToUrl(event: MouseEvent,status:string){
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
    if(status == PositionTrendTypeEnum.OPEN){
      window.localStorage.setItem("orderTypeFromDashboard", JSON.stringify(true))
      this.dashboardService.redirectToUrlWithActivePositions('client/order-management', undefined, OrderStatus[OrderStatus.OrdersOpenPositions]);
    } else if (status == InProgress.IN_PROGRESS) {
      candidatesStatusDataSet.push({"value":CandidatStatus.Applied});
      candidatesStatusDataSet.push({"value":CandidatStatus.Shortlisted});
      candidatesStatusDataSet.push({"value":CandidatStatus.CustomStatus});
      window.localStorage.setItem("candidateStatusListFromDashboard",JSON.stringify(candidatesStatusDataSet));
      window.localStorage.setItem("orderTypeFromDashboard", JSON.stringify(true))
      this.dashboardService.redirectToUrlWithActivePositions('client/order-management', undefined, OrderStatus[OrderStatus.InProgress]);
    }else if(status == PositionTrendTypeEnum.FILLED){
      candidatesStatusDataSet.push({"value":CandidatStatus.OnBoard});
      activeOrderStatus.push({"value":OrderStatus.InProgress, "name": PositionTrendTypeEnum.IN_PROGRESS})
      window.localStorage.setItem("candidateStatusListFromDashboard",JSON.stringify(candidatesStatusDataSet));
      window.localStorage.setItem('candidatesOrderStatusListFromDashboard', JSON.stringify(activeOrderStatus));
      window.localStorage.setItem("orderTypeFromDashboard", JSON.stringify(true))
      this.dashboardService.redirectToUrlWithActivePositions('client/order-management', undefined, status);
    }
  }
}
