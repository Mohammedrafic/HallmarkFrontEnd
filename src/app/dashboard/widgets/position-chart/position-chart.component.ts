import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Store } from '@ngxs/store';
import { BusinessUnitType } from '../../../shared/enums/business-unit-type';
import { UserState } from '../../../store/user.state';
import { CandidatesPositionDataModel } from '../../models/candidates-positions.model';
import { DashboardService } from '../../services/dashboard.service';

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
  

  private mousePosition = {
    x: 0,
    y: 0,
  };

  constructor(private readonly dashboardService: DashboardService, private store: Store ) {}

  public defineMousePosition($event: MouseEvent): void {
    this.mousePosition.x = $event.screenX;
    this.mousePosition.y = $event.screenY;
  }

  public toSourceContent(event: MouseEvent): void {
    let ltaorderending = true;
    if (this.mousePosition.x === event.screenX && this.mousePosition.y === event.screenY) {
      const user = this.store.selectSnapshot(UserState.user);
      if (user?.businessUnitType != null && user?.businessUnitType == BusinessUnitType.Agency) {
        this.dashboardService.redirectToUrl('agency/order-management/', this.chartData === undefined ? 0 : this.chartData.orderStatus,undefined,ltaorderending);

      } else {
        this.dashboardService.redirectToUrl('client/order-management/', this.chartData === undefined ? 0 : this.chartData.orderStatus,undefined,ltaorderending);
      }
    }
  }
}
