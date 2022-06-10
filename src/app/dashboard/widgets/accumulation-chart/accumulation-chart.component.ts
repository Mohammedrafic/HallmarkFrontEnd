import { Component, Input, OnInit, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { ChartAccumulation, DonutChartData } from '../../models/chart-accumulation-widget.model';
import { TooltipSettingsModel } from '@syncfusion/ej2-charts/src/common/model/base-model';
import { LegendSettingsModel } from '@syncfusion/ej2-charts/src/common/legend/legend-model';
import { BehaviorSubject, Observable, combineLatest, distinctUntilChanged } from 'rxjs';
import { map } from 'rxjs/operators';
import lodashFilter from 'lodash/fp/filter';
import lodashMap from 'lodash/fp/map';
import includes from 'lodash/fp/includes';
import isEqual from 'lodash/fp/isEqual';
import { legendPalette } from '../../constants/legend-palette';
import { AbstractSFComponentDirective } from '@shared/directives/abstract-sf-component.directive';

@Component({
  selector: 'app-accumulation-chart',
  templateUrl: './accumulation-chart.component.html',
  styleUrls: ['../widget-legend.component.scss', './accumulation-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccumulationChartComponent extends AbstractSFComponentDirective implements OnInit {
  @Input() public chartData: ChartAccumulation | undefined;

  public formattedChartData: DonutChartData[];
  public toggleLegend: number[] = [];
  public filteredChartData$: Observable<DonutChartData[]>;

  public readonly palette: string[] = legendPalette;
  public readonly tooltipSettings: TooltipSettingsModel = {
    enable: true,
    template:
      '<div class="widget-tooltip"><div>${x}</div><b>${y}</b></div>',
  };
  public readonly legendSettings: LegendSettingsModel = { visible: false };

  private readonly chartData$: BehaviorSubject<ChartAccumulation | null> =
    new BehaviorSubject<ChartAccumulation | null>(null);

  private readonly selectedEntries$: BehaviorSubject<string[] | null> = new BehaviorSubject<string[] | null>(null);

  public ngOnChanges(changes: SimpleChanges): void {
    changes['chartData'] && this.handleChartDataChanges();
  }

  public ngOnInit(): void {
    this.filteredChartData$ = this.getFilteredChartData();
  }

  public onClickLegend(label: string): void {
    const currentValue = this.selectedEntries$.value;
    const nextValue = includes(label, currentValue)
      ? lodashFilter((currentValueLabel: string) => currentValueLabel !== label, currentValue)
      : [...(currentValue ?? []), label];

    this.selectedEntries$.next(nextValue);
  }

  public trackByHandler(_: number, donutChartData: DonutChartData): string {
    return donutChartData.label;
  }

  private handleChartDataChanges(): void {
    this.chartData$.next(this.chartData ?? null);
    this.chartData?.chartData &&
      !this.selectedEntries$.value &&
      this.selectedEntries$.next(lodashMap((donut: DonutChartData) => donut.label, this.chartData.chartData));
  }

  private getFilteredChartData(): Observable<DonutChartData[]> {
    return combineLatest([this.chartData$, this.selectedEntries$]).pipe(
      map(([chartData, selectedEntries]: [ChartAccumulation | null, string[] | null]) =>
        lodashFilter((donut: DonutChartData) => includes(donut.label, selectedEntries), chartData?.chartData)
      ),
      distinctUntilChanged((previous: DonutChartData[], current: DonutChartData[]) => isEqual(previous, current))
    );
  }
}
