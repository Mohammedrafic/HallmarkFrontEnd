import { Component, Input, ChangeDetectionStrategy, OnChanges, SimpleChanges, OnInit } from '@angular/core';

import flow from 'lodash/fp/flow';
import values from 'lodash/fp/values';
import flatten from 'lodash/fp/flatten';
import lodashMap from 'lodash/fp/map';
import thru from 'lodash/fp/thru';
import max from 'lodash/fp/max';
import includes from 'lodash/fp/includes';
import lodashFilter from 'lodash/fp/filter';
import { isEqual } from 'lodash';
import type {
  AxisModel,
  ChartAreaModel,
  LegendSettingsModel,
  TooltipSettingsModel,
  CrosshairSettingsModel,
} from '@syncfusion/ej2-charts';
import type { ChartComponent } from '@syncfusion/ej2-angular-charts';
import { Store } from '@ngxs/store';

import type { PositionByTypeDataModel, PositionsByTypeAggregatedModel } from '../../models/positions-by-type-aggregated.model';
import { AbstractSFComponentDirective } from '@shared/directives/abstract-sf-component.directive';
import { PositionTypeEnum } from '../../enums/position-type.enum';
import { TimeSelectionEnum } from '../../enums/time-selection.enum';
import { SwitchMonthWeekTimeSelection } from '../../store/dashboard.actions';
import { BehaviorSubject, combineLatest, distinctUntilChanged, filter, map, Observable } from 'rxjs';
import { positionTrendLegendPalette } from '../../constants/position-trend-legend-palette';
import { PositionTrendChartStatuses } from '../../enums/position-trend-legend-palette.enum';
import { WidgetLegengDataModel } from '../../models/widget-legend-data.model';

@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LineChartComponent extends AbstractSFComponentDirective<ChartComponent> implements OnChanges, OnInit {
  @Input() public chartData: PositionsByTypeAggregatedModel | undefined;
  @Input() public isLoading: boolean;
  @Input() public timeSelection: TimeSelectionEnum;

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
  public readonly weeklySelection: TimeSelectionEnum = TimeSelectionEnum.Weekly;
  public readonly monthlySelection: TimeSelectionEnum = TimeSelectionEnum.Monthly;
  public monthMode: boolean = true;
  public chartLegend: any[];
  public filteredChartData$: Observable<any>;

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

  private readonly selectedEntries$: BehaviorSubject<string[] | null> = new BehaviorSubject<string[] | null>(null);
  private readonly chartData$: BehaviorSubject<PositionsByTypeAggregatedModel | null> = new BehaviorSubject<PositionsByTypeAggregatedModel | null>(null);

  constructor(private readonly store: Store) {
    super();
  }

  ngOnInit(): void {
    this.filteredChartData$ = this.getFilteredChartData();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    changes['chartData'] && this.handleChartDataChange();
    this.monthMode = this.timeSelection === TimeSelectionEnum.Monthly;
  }

  private handleChartDataChange(): void {
    if (!this.chartData) return;

    this.chartLegend = this.generateLegendData(this.chartData);
    this.handleChartDataChanges(this.chartData);
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

  public onSwicthTo(timeSelection: TimeSelectionEnum): void {
    this.monthMode = timeSelection === TimeSelectionEnum.Monthly;
    this.store.dispatch(new SwitchMonthWeekTimeSelection(timeSelection));
  }

  public onClickLegend(label: string): void {
    const currentValue = this.selectedEntries$.value;
    const nextValue = includes(label, currentValue)
      ? lodashFilter((currentValueLabel: string) => currentValueLabel !== label, currentValue)
      : [...(currentValue ?? []), label];
    this.selectedEntries$.next(nextValue);
  }

  public redirectToSourceContent(): void {
    // TODO implement this method in scope ein-2623
  }

  public generateLegendData(chartData: PositionsByTypeAggregatedModel): WidgetLegengDataModel[] {
    return Object.entries(chartData).map(([key, value]) => {
      const [previousValue, currentValue] = value.slice(-2);
      const coefficient = previousValue.value === 0 ? 1 : previousValue.value;
      return {
        label: key,
        value: ((currentValue.value - previousValue.value) / coefficient) * 100,
        color: positionTrendLegendPalette[key as PositionTrendChartStatuses],
      };
    });
  }

  private getFilteredChartData(): Observable<PositionsByTypeAggregatedModel> {
    return combineLatest([this.chartData$, this.selectedEntries$]).pipe(
      filter(([chartData]) => !!chartData),
      map(([chartData, selectedEntries]: [PositionsByTypeAggregatedModel | null, string[] | null]) =>
        flow([
          Object.entries,
          (arr) => arr.filter(([key, value]: [key: string, value: number]) => includes(key, selectedEntries)),
          Object.fromEntries,
        ])(chartData)
      ),
      distinctUntilChanged((previous: any, current: any) => isEqual(previous, current))
    );
  }

  private handleChartDataChanges(chartData: PositionsByTypeAggregatedModel): void {
    this.chartData$.next(chartData ?? null);
    this.chartData &&
      !this.selectedEntries$.value &&
      this.selectedEntries$.next(lodashMap(([key, value]) => key, Object.entries(this.chartData)));
  }
}
