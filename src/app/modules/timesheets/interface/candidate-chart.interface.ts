import { AxisModel, ChartAreaModel, DataLabelSettingsModel } from '@syncfusion/ej2-angular-charts';
import { LegendSettingsModel } from '@syncfusion/ej2-charts/src/common/legend/legend-model';
import { TooltipSettingsModel } from '@syncfusion/ej2-charts/src/common/model/base-model';

interface ChartSizeSettings {
  width: string;
  height: string;
}

export interface ProfileDetailsHoursChartSettings {
  xAxis: AxisModel;
  yAxis: AxisModel;
  legend: LegendSettingsModel;
  chartArea: ChartAreaModel;
  dataLabel: DataLabelSettingsModel;
  tooltip: TooltipSettingsModel;
  donutChart: ChartSizeSettings,
  barChart: ChartSizeSettings;
  background: string;
}

export interface ChartPointRenderEvent<T = string> {
  point: {
    x: T,
    y: number;
    index: number;
  };
  fill: string;
}

export interface DonutChartData<T = string> {
  x: T;
  y: number;
}
