import flow from 'lodash/fp/flow';
import values from 'lodash/fp/values';
import flatten from 'lodash/fp/flatten';
import lodashMap from 'lodash/fp/map';
import thru from 'lodash/fp/thru';
import max from 'lodash/fp/max';
import type {
  AxisModel,
  ChartAreaModel,
  LegendSettingsModel,
  TooltipSettingsModel,
  CrosshairSettingsModel,
} from '@syncfusion/ej2-charts';
import type { ChartComponent } from '@syncfusion/ej2-angular-charts';

import { Component, Input, ChangeDetectionStrategy, OnChanges, SimpleChanges } from '@angular/core';
import type { KeyValue } from '@angular/common';

import type { PositionByTypeDataModel, PositionsByTypeAggregatedModel } from '../../models/positions-by-type-aggregated.model';
import { AbstractSFComponentDirective } from '@shared/directives/abstract-sf-component.directive';
import { PositionTypeEnum } from '../../enums/position-type.enum';

@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LineChartComponent extends AbstractSFComponentDirective<ChartComponent> implements OnChanges {
  @Input() public chartData: PositionsByTypeAggregatedModel | undefined;
  @Input() public isLoading: boolean;

  public primaryYAxis: AxisModel = {
    minimum: 0,
    majorGridLines: { width: 1, dashArray: '5' },
    lineStyle: { width: 0 },
  };

  public readonly chartArea: ChartAreaModel = { border: { width: 0 } };
  public readonly legendShape: string = 'Circle';
  public readonly lineWidthInPixels: number = 3;
  public readonly positionTypeEnum: typeof PositionTypeEnum = PositionTypeEnum;
  public readonly primaryXAxis: AxisModel = { valueType: 'Category', majorGridLines: { width: 0 } };
  public readonly xAxisName: keyof PositionByTypeDataModel = 'month';
  public readonly yAxisName: keyof PositionByTypeDataModel = 'value';
  public readonly type: string = 'Spline';

  public readonly crosshairSettings: CrosshairSettingsModel = {
    enable: true,
    lineType: 'Vertical',
    line: { color: 'var(--primary-active-blue-20)' },
  };

  public tooltipSettings: TooltipSettingsModel = {
    enable: true,
    shared: true,
    fill: 'var(--tooltip-background)',
    textStyle: { color: 'var(--tooltip-text)' },
    opacity: 1,
    header: '',
  };

  public readonly legendSettings: LegendSettingsModel = {
    alignment: 'Near',
    enablePages: false,
    position: 'Top',
    visible: true,
  };

  public ngOnChanges(changes: SimpleChanges): void {
    changes['chartData'] && this.handleChartDataChange();
  }

  public trackByHandler(_: number, keyValue: KeyValue<string, PositionByTypeDataModel[]>): string {
    return keyValue.key;
  }

  private handleChartDataChange(): void {
    if (!this.chartData) return;

    const maximumDataValue = this.getMaximumDataValue();

    this.primaryYAxis = {
      ...this.primaryYAxis,
      maximum: maximumDataValue + this.lineWidthInPixels,
      interval: maximumDataValue / 2,
    };
  }

  private getMaximumDataValue(): number {
    return flow(
      values,
      flatten,
      lodashMap((positionByTypeData: PositionByTypeDataModel) => positionByTypeData.value),
      max,
      thru((value: number) => Math.ceil(value / 10) * 10)
    )(this.chartData);
  }
}
