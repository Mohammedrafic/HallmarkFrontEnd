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

import type { PositionByTypeDataModel } from '../../models/positions-by-type-aggregated.model';
import { AbstractSFComponentDirective } from '@shared/directives/abstract-sf-component.directive';
import { TimeSelectionEnum } from '../../enums/time-selection.enum';
import { BehaviorSubject, combineLatest, distinctUntilChanged, filter, map, Observable } from 'rxjs';
import { WidgetLegengDataModel } from '../../models/widget-legend-data.model';
import { DashboardService } from '../../services/dashboard.service';
import { SkillCategoryTypeEnum } from '../../enums/skill-category-type.enum';
import { skillCategoryTrendLegendPalette } from '../../constants/skill-category-legend-palette';
import { BillRateBySkillCategoryTypeAggregatedModel } from '../../models/bill-rate-by-skill-category-type-aggregated.model';

@Component({
  selector: 'app-bill-rate-widget',
  templateUrl: './bill-rate-widget.component.html',
  styleUrls: ['./bill-rate-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BillRateWidgetComponent extends AbstractSFComponentDirective<ChartComponent> implements OnChanges, OnInit {
  @Input() public chartData: BillRateBySkillCategoryTypeAggregatedModel | undefined;
  @Input() public isLoading: boolean;
  @Input() public timeSelection: TimeSelectionEnum;
  @Input() public isDarkTheme: boolean | false;
  @Input() public description: string;
  @Input() public slideBar: any = false;

  public primaryYAxis: AxisModel = {
    minimum: 0,
    majorGridLines: { width: 1, dashArray: '5' },
    lineStyle: { width: 0 },
    labelStyle: { fontFamily: 'Open Sans', size: '14px', color: 'var(--secondary-dark-blue-20)' }
  };

  public primaryYAxisDarkTheme: AxisModel = {
    minimum: 0,
    majorGridLines: { width: 1, dashArray: '5' },
    lineStyle: { width: 0 },
    labelStyle: { fontFamily: 'Open Sans', size: '14px', color: 'var(--secondary-dark-blue-30)' }
  };

  public readonly chartArea: ChartAreaModel = { border: { width: 0 } };
  public readonly legendShape: string = 'Circle';
  public readonly lineWidthInPixels: number = 3;
  public readonly skillCategoryTypeEnum: typeof SkillCategoryTypeEnum = SkillCategoryTypeEnum;
  public readonly primaryXAxis: AxisModel = {
    valueType: 'Category',
    majorGridLines: { width: 0 },
    labelStyle: { fontFamily: 'Open Sans', size: '14px', color: 'var(--secondary-dark-blue-20)' }
  };

  public readonly primaryXAxisDarkTheme: AxisModel = {
    valueType: 'Category',
    majorGridLines: { width: 0 },
    labelStyle: { fontFamily: 'Open Sans', size: '14px', color: 'var(--secondary-dark-blue-30)' }
  };
  public readonly xAxisName: keyof PositionByTypeDataModel = 'month';
  public readonly yAxisName: keyof PositionByTypeDataModel = 'value';
  public readonly type: string = 'Spline';
  public chartLegend: WidgetLegengDataModel[];
  public filteredChartData$: Observable<any>;
  public palettes: string[] = [];

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

  public tooltipDarkSettings: TooltipSettingsModel = {
    enable: true,
    shared: true,
    fill: 'var(--tooltip-dark-background)',
    textStyle: { color: 'var(--tooltip-dark-text)' },
    opacity: 1,
    header: '',
  };

  public readonly legendSettings: LegendSettingsModel = { visible: false };

  private readonly selectedEntries$: BehaviorSubject<string[] | null> = new BehaviorSubject<string[] | null>(null);
  private readonly chartData$: BehaviorSubject<BillRateBySkillCategoryTypeAggregatedModel | null> = new BehaviorSubject<BillRateBySkillCategoryTypeAggregatedModel | null>(null);

  constructor(
    private readonly store: Store,
    private readonly dashboardService: DashboardService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.filteredChartData$ = this.getFilteredChartData();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    changes['chartData'] && this.handleChartDataChange();
  }

  private handleChartDataChange(): void {
    if (!this.chartData) return;

    this.chartLegend = this.generateLegendData(this.chartData);
    this.handleChartDataChanges(this.chartData);
    const maximumDataValue = this.getMaximumDataValue();
    const correctorChartHeight = Math.floor(maximumDataValue * 0.10);
    this.primaryYAxis = {
      ...this.primaryYAxis,
      maximum: maximumDataValue + correctorChartHeight,
      interval: maximumDataValue / 5,
      labelFormat: '${value}'
    };
    this.primaryYAxisDarkTheme = {
      ...this.primaryYAxisDarkTheme,
      maximum: maximumDataValue + correctorChartHeight,
      interval: maximumDataValue / 5,
    }
  }

  private getMaximumDataValue(): number {
    return flow(
      values,
      flatten,
      lodashMap((positionByTypeData: PositionByTypeDataModel) => positionByTypeData.value),
      max,
      thru((value: number) => Math.ceil(value / 50) * 50)
    )(this.chartData);
  }

  public onClickLegend(label: string): void {
    const currentValue = this.selectedEntries$.value;
    const nextValue = includes(label, currentValue)
      ? lodashFilter((currentValueLabel: string) => currentValueLabel !== label, currentValue)
      : [...(currentValue ?? []), label];
    this.selectedEntries$.next(nextValue);
  }

  public generateLegendData(chartData: BillRateBySkillCategoryTypeAggregatedModel): WidgetLegengDataModel[] {
    return Object.entries(chartData).map(([key, value], index) => {
      const [previousValue, currentValue] = value.slice(-2);
      const coefficient = previousValue.value === 0 ? 1 : previousValue.value;
      const paletteColor = skillCategoryTrendLegendPalette[index];
      this.palettes.push(paletteColor);
      return {
        label: key,
        value: ((currentValue?.value - previousValue?.value) / coefficient) * 100,
        text: " ",
        color: paletteColor,
        totalCount: parseFloat(value.reduce((count, current) => { return current.value; }, 0).toFixed(2))
      };
    });
  }

  private getFilteredChartData(): Observable<BillRateBySkillCategoryTypeAggregatedModel> {
    return combineLatest([this.chartData$, this.selectedEntries$]).pipe(
      filter(([chartData]) => !!chartData),
      map(([chartData, selectedEntries]: [BillRateBySkillCategoryTypeAggregatedModel | null, string[] | null]) =>
        flow([
          Object.entries,
          (arr) => arr.filter(([key, value]: [key: string, value: number]) => includes(key, selectedEntries)),
          Object.fromEntries,
        ])(chartData)

      ),
      distinctUntilChanged((previous: any, current: any) => isEqual(previous, current))
    );
  }

  private handleChartDataChanges(chartData: BillRateBySkillCategoryTypeAggregatedModel): void {
    this.chartData$.next(chartData ?? null);
    this.chartData &&
      !this.selectedEntries$.value &&
      this.selectedEntries$.next(lodashMap(([key, value]) => key, Object.entries(this.chartData)));
  }
}
