import { Component, Input, OnInit, SimpleChanges, ChangeDetectionStrategy, OnChanges } from '@angular/core';

import { BehaviorSubject, Observable, combineLatest, distinctUntilChanged } from 'rxjs';
import { map } from 'rxjs/operators';
import lodashFilter from 'lodash/fp/filter';
import lodashMap from 'lodash/fp/map';
import includes from 'lodash/fp/includes';
import isEqual from 'lodash/fp/isEqual';
import type {
  AccumulationChartComponent as SFAccumulationChartComponent,
  TooltipSettingsModel,
  LegendSettingsModel,
} from '@syncfusion/ej2-angular-charts';

import { ChartAccumulation, DonutChartData } from '../../models/chart-accumulation-widget.model';
import { AbstractSFComponentDirective } from '@shared/directives/abstract-sf-component.directive';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-accumulation-chart',
  templateUrl: './accumulation-chart.component.html',
  styleUrls: ['../widget-legend.component.scss', './accumulation-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccumulationChartComponent
  extends AbstractSFComponentDirective<SFAccumulationChartComponent>
  implements OnChanges, OnInit
{
  @Input() public chartData: ChartAccumulation | undefined;
  @Input() public isLoading: boolean;

  public toggleLegend: number[] = [];
  public filteredChartData$: Observable<DonutChartData[]>;

  public readonly tooltipSettings: TooltipSettingsModel = {
    enable: true,
    template: '<div class="widget-tooltip"><div>${x}</div><b>${y}</b></div>',
  };
  public readonly legendSettings: LegendSettingsModel = { visible: false };

  private readonly chartData$: BehaviorSubject<ChartAccumulation | null> =
    new BehaviorSubject<ChartAccumulation | null>(null);

  private readonly selectedEntries$: BehaviorSubject<string[] | null> = new BehaviorSubject<string[] | null>(null);

  private mousePosition = {
    x: 0,
    y: 0,
  };

  constructor(private readonly dashboardService: DashboardService) {
    super();
  }

  public defineMousePosition($event: MouseEvent): void {
    this.mousePosition.x = $event.screenX;
    this.mousePosition.y = $event.screenY;
  }

  public redirectToSourceContent(event: MouseEvent): void {
    if (this.mousePosition.x === event.screenX && this.mousePosition.y === event.screenY) {
      this.dashboardService.redirectToUrl('client/order-management');
    }
  }

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
