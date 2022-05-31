import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-chart-line-widget',
  templateUrl: './chart-line-widget.component.html',
  styleUrls: ['./chart-line-widget.component.scss'],
})
export class ChartLineWidgetComponent {
  @Input() widget: any;

  chartId = Date.now().toString();
  
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
