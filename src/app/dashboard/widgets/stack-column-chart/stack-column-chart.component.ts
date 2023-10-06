import { Component, Input, OnInit, SimpleChanges, ChangeDetectionStrategy, OnChanges } from '@angular/core';

import { BehaviorSubject, Observable, combineLatest, distinctUntilChanged } from 'rxjs';
import { map } from 'rxjs/operators';
import lodashFilter from 'lodash/fp/filter';
import lodashMap from 'lodash/fp/map';
import includes from 'lodash/fp/includes';
import isEqual from 'lodash/fp/isEqual';
import { ILoadedEventArgs, ChartTheme, IAxisLabelRenderEventArgs } from '@syncfusion/ej2-angular-charts';

import { ChartAccumulation, DonutChartData } from '../../models/chart-accumulation-widget.model';
import { AbstractSFComponentDirective } from '@shared/directives/abstract-sf-component.directive';
import { DashboardService } from '../../services/dashboard.service';
import { WidgetLegengDataModel } from '../../models/widget-legend-data.model';
import { LegendPositionEnum } from '../../enums/legend-position.enum';
import { Store } from '@ngxs/store';
import { AlertService } from '@shared/services/alert.service';
import { ChartComponent } from '@syncfusion/ej2-angular-charts';
import { DASHBOARD_FILTER_STATE } from '@shared/constants';
import { SetLastSelectedOrganizationAgencyId } from 'src/app/store/user.actions';
import { OrderStatus } from '@shared/enums/order-management';
import { PositionTrendTypeEnum } from '../../enums/position-trend-type.enum';
import { CandidatStatus } from '@shared/enums/applicant-status.enum';
import { ActivePositionsChartStatuses } from '../../enums/active-positions-legend-palette.enum';

@Component({
  selector: 'app-stack-column-chart',
  templateUrl: './stack-column-chart.component.html',
  styleUrls: ['./stack-column-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StackColumnChartComponent extends AbstractSFComponentDirective<ChartComponent> implements OnChanges, OnInit{

  @Input() public chartData: ChartAccumulation | undefined;
  @Input() public chartDatachanges: ChartAccumulation | undefined;
  @Input() public isLoading: boolean;
  @Input() public isDarkTheme: boolean;
  @Input() public description: string;
  @Input() public averageFlag: boolean =false;

  public toggleLegend: number[] = [];
  public filteredChartData$: Observable<DonutChartData[]>;
  public legendData: WidgetLegengDataModel[] = [];
  public totalScore: number = 0;
  public totalval: number = 0;
  public legendPosition: LegendPositionEnum = LegendPositionEnum.Right;
  public datalabel: Object;
  public ontooltipRender: Function;



  private readonly chartData$: BehaviorSubject<ChartAccumulation | null> = new BehaviorSubject<ChartAccumulation | null>(null);

  private readonly selectedEntries$: BehaviorSubject<string[] | null> = new BehaviorSubject<string[] | null>(null);


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
public readonly chartArea: Object = { border: { width: 0 } };


public tooltipSettings: Object = {
  enable: true,
  shared: true,
  fill: 'var(--tooltip-background)',
  textStyle: { color: 'var(--tooltip-text)' },
  opacity: 1,
  header: '',
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

  constructor(private readonly dashboardService: DashboardService, private store: Store, private alertService: AlertService
  ) {

    super();

  }

  public redirectToSourceContent(status: any): void {    
    let candidatesStatusDataSet:any = []
    let activeOrderStatus:any = []
    let lastSelectedOrganizationId = window.localStorage.getItem("lastSelectedOrganizationId");
    let filteredList = JSON.parse(window.localStorage.getItem(DASHBOARD_FILTER_STATE) as string) || [];
    if (filteredList.length > 0) {
      let organizations = filteredList.filter((ele: any) => ele.column == "organizationIds").sort((a: any, b: any) => a.value - b.value);
      if (organizations.length > 0 && organizations[0].value != lastSelectedOrganizationId) {
        this.store.dispatch(
          new SetLastSelectedOrganizationAgencyId({
            lastSelectedAgencyId: null,
            lastSelectedOrganizationId: organizations[0].value
          })
        );
      }
    }
      window.localStorage.setItem("orderTypeFromDashboard", JSON.stringify(true));
      if(status ==  OrderStatus[OrderStatus.Open]){
        this.dashboardService.redirectToUrlWithActivePositions('client/order-management', undefined, OrderStatus[OrderStatus.OrdersOpenPositions]);
      }else{

        if(status === ActivePositionsChartStatuses.IN_PROGRESS){
          status = PositionTrendTypeEnum.IN_PROGRESS;
          candidatesStatusDataSet.push({"value":CandidatStatus.Applied});
          candidatesStatusDataSet.push({"value":CandidatStatus.Shortlisted});
          candidatesStatusDataSet.push({"value":CandidatStatus.CustomStatus});
        }
        else if(status === ActivePositionsChartStatuses.PENDING){
          status = 'In Progress (Pending)';
          candidatesStatusDataSet.push({"value":CandidatStatus.Offered});
        }
        else if(status === ActivePositionsChartStatuses.ACCEPTED){
          status = 'In Progress (Accepted)';
          candidatesStatusDataSet.push({"value":CandidatStatus.Accepted});
        }
        else if(OrderStatus[OrderStatus.Filled] === status){
          candidatesStatusDataSet.push({"value":CandidatStatus.OnBoard});
          activeOrderStatus.push({"value":OrderStatus.InProgress, "name": PositionTrendTypeEnum.IN_PROGRESS})
          window.localStorage.setItem("candidatesOrderStatusListFromDashboard",JSON.stringify(activeOrderStatus));
        }      
          window.localStorage.setItem("candidateStatusListFromDashboard",JSON.stringify(candidatesStatusDataSet));
          this.dashboardService.redirectToUrlWithActivePositions('client/order-management', undefined, status);
      }
      
      
  }

  public ngOnChanges(changes: SimpleChanges): void {
    changes['chartData'] && this.handleChartDataChanges();
    this.totalScore = 0;
    this.chartData?.chartData.forEach(obj => {
      this.totalScore += obj.value;
    });
  }

  public ngOnInit(): void {
    this.datalabel = { visible: true, position: 'Outside' };
    this.filteredChartData$ = this.getFilteredChartData();
  }

  public onClickLegend(label: string): void {

    const currentValue = this.selectedEntries$.value;
    const nextValue = includes(label, currentValue)
      ? lodashFilter((currentValueLabel: string) => currentValueLabel !== label, currentValue)
      : [...(currentValue ?? []), label];

    this.selectedEntries$.next(nextValue);
    this.totalScore = 0;
    this.chartData?.chartData.forEach(obj => {
      if (includes(obj.label, this.selectedEntries$.value)) {
        this.totalScore += obj.value;
      }
    });
  }

  public trackByHandler(_: number, donutChartData: DonutChartData): string {
    return donutChartData.label;
  }

  private handleChartDataChanges(): void {
    this.chartDatachanges = this.chartData;
    this.totalval=0;
    this.chartDatachanges?.chartData.forEach(obj => {
      this.totalval += obj.value;
    });
    this.chartDatachanges?.chartData.forEach(obj => {
      obj.text = (obj.value&&this.totalval)?(Math.round(obj.value / this.totalval * 100)).toString():"0";
    });  


    this.legendData = this.chartData?.chartData as WidgetLegengDataModel[];
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
  
  private mousePosition = {
    x: 0,
    y: 0,
  }

  public defineMousePosition($event: MouseEvent): void {
    this.mousePosition.x = $event.screenX;
    this.mousePosition.y = $event.screenY;
  }


}
