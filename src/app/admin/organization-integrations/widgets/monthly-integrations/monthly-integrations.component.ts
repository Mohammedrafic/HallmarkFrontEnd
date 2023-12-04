import { Component, Input, OnInit, ChangeDetectionStrategy, OnChanges } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, distinctUntilChanged,of } from 'rxjs';

import { map } from 'rxjs/operators';
import lodashFilter from 'lodash/fp/filter';
import lodashMap from 'lodash/fp/map';
import includes from 'lodash/fp/includes';
import isEqual from 'lodash/fp/isEqual';

import { LegendPositionEnum } from '../../../../dashboard/enums/legend-position.enum';
import { ChartAccumulation, DonutChartData, } from '../../../../dashboard/models/chart-accumulation-widget.model';
import { WidgetLegengDataModel } from '../../../../dashboard/models/widget-legend-data.model';
import { DashboardService } from '../../../../dashboard/services/dashboard.service';
import { Store } from '@ngxs/store';
import { AlertService } from '../../../../shared/services/alert.service';
import { AbstractSFComponentDirective } from '../../../../shared/directives/abstract-sf-component.directive';
import { ChartComponent } from '@syncfusion/ej2-angular-charts';
 
 
@Component({
  selector: 'app-monthly-integrations',
  templateUrl: './monthly-integrations.component.html',
  styleUrls: ['./monthly-integrations.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MonthlyIntegrationsComponent extends AbstractSFComponentDirective<ChartComponent> implements OnChanges, OnInit {

  //@Input() public chartData: ChartAccumulation | undefined;
  //@Input() public chartDatachanges: ChartAccumulation | undefined;
   public isLoading: boolean;
   public isDarkTheme: boolean;
   public description: string;
   public averageFlag: boolean = false;

  public toggleLegend: number[] = [];
  public filteredChartData$: Observable<DonutChartData[]>;
  public legendData: WidgetLegengDataModel[] = [];
  public totalScore: number = 0;
  public totalval: number = 0;
  public legendPosition: LegendPositionEnum = LegendPositionEnum.Right;
  public datalabel: Object;
  public ontooltipRender: Function;

  public readonly chartArea: Object = { border: { width: 0 } };


  public primaryYAxis: Object = {
    minimum: 0,
    majorGridLines: { width: 1, dashArray: '5' },
    lineStyle: { width: 0 },
    labelStyle: { fontFamily: 'Open Sans', size: '12px', color: 'var(--secondary-dark-blue-20)' }
  };

  public primaryYAxisDarkTheme: Object = {
    minimum: 0,
    majorGridLines: { width: 1, dashArray: '5' },
    lineStyle: { width: 0 },
    labelStyle: { fontFamily: 'Open Sans', size: '12px', color: 'var(--secondary-dark-blue-30)' }
  };

  public readonly primaryXAxis: Object = {
    valueType: 'Category',
    majorGridLines: { width: 0 },
    labelStyle: { fontFamily: 'Open Sans', size: '10px', color: 'var(--secondary-dark-blue-20)' }
  };

  public readonly primaryXAxisDarkTheme: Object = {
    valueType: 'Category',
    majorGridLines: { width: 0 },
    labelStyle: { fontFamily: 'Open Sans', size: '10px', color: 'var(--secondary-dark-blue-30)' }
  };
  public tooltipDarkSettings: Object = {
    enable: true,
    shared: true,
    fill: 'var(--tooltip-dark-background)',
    textStyle: { color: 'var(--tooltip-dark-text)' },
    opacity: 1,
    header: '',
  };

  public readonly legendSettings: Object = { visible: false };

  public tooltipSettings: Object = {
    enable: true,
    shared: true,
    fill: 'var(--tooltip-background)',
    textStyle: { color: 'var(--tooltip-text)' },
    opacity: 1,
    header: '',
  };

  constructor( private store: Store ) {
    super();
  }

  ngOnInit(): void {
    this.datalabel = { visible: true, position: 'Outside' };
    this.filteredChartData$ = this.getFilteredChartData();
  }

  public ngOnChanges(): void {
  }
    
  private getFilteredChartData(): Observable<DonutChartData[]> {
    //return combineLatest([this.chartData$, this.selectedEntries$]).pipe(
    //  map(([chartData, selectedEntries]: [ChartAccumulation | null, string[] | null]) =>
    //    lodashFilter((donut: DonutChartData) => includes(donut.label, selectedEntries), chartData?.chartData)
    //  ),
    //  distinctUntilChanged((previous: DonutChartData[], current: DonutChartData[]) => isEqual(previous, current))
    //);

    return of( [{
        label: "Jan",
        value: 20,
        text: "Jan",
        color: "Red",
        average: 30
      }, {
        label: "Feb",
        value: 35,
        text: "Feb",
        color: "Red",
        average: 30
      }, {
        label: "Mar",
        value: 40,
        text: "Mar",
        color: "Red",
        average: 30
      }, {
        label: "Apr",
        value: 50,
        text: "Apr",
        color: "Red",
        average: 30
      }, {
        label: "May",
        value: 20,
        text: "May",
        color: "Red",
        average: 30
      }, {
        label: "Jun",
        value: 60,
        text: "Jun",
        color: "Red",
        average: 30
      }, {
        label: "Jul",
        value: 40,
        text: "Jul",
        color: "Red",
        average: 30
      }, {
        label: "Aug",
        value: 80,
        text: "Aug",
        color: "Red",
        average: 30
      }, {
        label: "Sep",
        value: 90,
        text: "Sep",
        color: "Red",
        average: 30
      }, {
        label: "Oct",
        value: 15,
        text: "Oct",
        color: "Red",
        average: 30
      }, {
        label: "Nov",
        value: 90,
        text: "Nov",
        color: "Red",
        average: 30
      }, {
        label: "Dec",
        value: 120,
        text: "Dec",
        color: "Red",
        average: 30
      }]);
  }

}
