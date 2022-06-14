import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss'],
})
export class LineChartComponent {
  @Input() widget: any;
  
  primaryXAxis = {
    valueType: 'Category',
    labelFormat: 'y',
    visible: false,
  };

  primaryYAxis = {
    valueType: 'Category',
    labelFormat: 'y',
    visible: false,
  };

  chartArea = {
    border: {
      width: 0,
    },
    color: 'red',
  };
}
