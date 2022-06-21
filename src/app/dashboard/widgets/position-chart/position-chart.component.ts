import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { CandidatesPositionDataModel } from '../../models/candidates-positions.model';

@Component({
  selector: 'app-position-chart',
  templateUrl: './position-chart.component.html',
  styleUrls: ['./position-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PositionChartComponent {
  @Input() public isLoading: boolean;
  @Input() public chartData: CandidatesPositionDataModel | undefined;

  private mousePosition = {
    x: 0,
    y: 0,
  };

  constructor(private readonly router: Router) {}

  public mouseDown($event: MouseEvent): void {
    this.mousePosition.x = $event.screenX;
    this.mousePosition.y = $event.screenY;
  }

  public toSourceContent(event: MouseEvent): void {
    if (this.mousePosition.x === event.screenX && this.mousePosition.y === event.screenY) {
      this.router.navigateByUrl('client/order-management');
    }
  }
}
