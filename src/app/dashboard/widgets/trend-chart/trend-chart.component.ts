import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { AbstractSFComponentDirective } from '@shared/directives/abstract-sf-component.directive';
import type { AxisModel, ChartAreaModel, ChartComponent } from '@syncfusion/ej2-angular-charts';
import { PositionTrend } from '../../models/position-trend.model';

@Component({
  selector: 'app-trend-chart',
  templateUrl: './trend-chart.component.html',
  styleUrls: ['./trend-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrendChartComponent extends AbstractSFComponentDirective<ChartComponent> {
  @Input() public widget: PositionTrend | undefined;

  public primaryXAxis: AxisModel = {
    valueType: 'Category',
    visible: false,
  };

  public primaryYAxis: AxisModel = {
    valueType: 'Category',
    visible: false,
  };

  public chartArea: ChartAreaModel = {
    border: {
      width: 0,
    },
  };
}
