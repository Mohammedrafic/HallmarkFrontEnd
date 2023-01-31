import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Store } from '@ngxs/store';
import { OrderStatus } from '@shared/enums/order-management';
import { BusinessUnitType } from '../../../shared/enums/business-unit-type';
import { UserState } from '../../../store/user.state';
import { CandidateStatusDataModel } from '../../models/candidate-status-dto.model';
import { DashboardService } from '../../services/dashboard.service';


@Component({
  selector: 'app-candidate-chart',
  templateUrl: './candidate-chart.component.html',
  styleUrls: ['./candidate-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CandidateChartComponent  {


  @Input() public isLoading: boolean;
  @Input() public chartData: CandidateStatusDataModel | undefined;
  @Input() public description: string;
  @Input() public isDarkTheme: boolean;
  @Input() public isLTAOrderEnding: boolean = false;
  

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
    if (this.mousePosition.x === event.screenX && this.mousePosition.y === event.screenY) {
      const user = this.store.selectSnapshot(UserState.user);
      if (user?.businessUnitType != null && (user?.businessUnitType != BusinessUnitType.Agency)) {
        this.dashboardService.redirectToUrl('client/order-management/',this.chartData === undefined ? 0 : OrderStatus.InProgress, this.chartData === undefined ? '' : this.chartData.statusName);

      } 
    }
  }

}
