import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { PositionInProgressDataModel } from '../../models/positions-in-progress.model';

@Component({
  selector: 'app-position-chart',
  templateUrl: './position-chart.component.html',
  styleUrls: ['./position-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PositionChartComponent implements OnInit {
  @Input() public isLoading: boolean;
  @Input() public chartData: PositionInProgressDataModel | undefined;

  constructor() { }

  ngOnInit(): void {
  }
}
