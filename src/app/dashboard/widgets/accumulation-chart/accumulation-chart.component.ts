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
import { WidgetLegengDataModel } from '../../models/widget-legend-data.model';
import { LegendPositionEnum } from '../../enums/legend-position.enum';
import { Store } from '@ngxs/store';
import { UserState } from '../../../store/user.state';
import { BusinessUnitType } from '../../../shared/enums/business-unit-type';
import { CandidatStatus } from '@shared/enums/applicant-status.enum';
import { ShowToast } from 'src/app/store/app.actions';
import { MessageTypes } from '@shared/enums/message-types';
import { CANDIDATE_STATUS, DASHBOARD_FILTER_STATE } from '@shared/constants';
import { AlertService } from '@shared/services/alert.service';
import { SetLastSelectedOrganizationAgencyId } from 'src/app/store/user.actions';
import { OrderStatus } from '@shared/enums/order-management';
import { PositionTrendTypeEnum } from '../../enums/position-trend-type.enum';

@Component({
  selector: 'app-accumulation-chart',
  templateUrl: './accumulation-chart.component.html',
  styleUrls: ['./accumulation-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccumulationChartComponent
  extends AbstractSFComponentDirective<SFAccumulationChartComponent>
  implements OnChanges, OnInit {
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

  public readonly tooltipSettings: TooltipSettingsModel = {
    enable: true,  
    template: '<div class="widget-tooltip"><div>${x}</div><b>${tooltip}%</b></div>',       
}

  public readonly legendSettings: LegendSettingsModel = { visible: false };

  private readonly chartData$: BehaviorSubject<ChartAccumulation | null> = new BehaviorSubject<ChartAccumulation | null>(null);

  private readonly selectedEntries$: BehaviorSubject<string[] | null> = new BehaviorSubject<string[] | null>(null);

  constructor(private readonly dashboardService: DashboardService, private store: Store, private alertService: AlertService
  ) {

    super();

  }

  public redirectToSourceContent(status: string): void {
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
    const user = this.store.selectSnapshot(UserState.user);
    if (this.chartData?.title == "Active Positions") {
      if (user?.businessUnitType != null && user?.businessUnitType == BusinessUnitType.Agency) {
        this.dashboardService.redirectToUrl('agency/candidate-details');
      } else {
        if(OrderStatus[OrderStatus.Open] ===  status){
          this.dashboardService.redirectToUrlWithActivePositions('client/order-management', undefined, OrderStatus[OrderStatus.OrdersOpenPositions]);
        }
        else if(status === 'In Progress'){
          candidatesStatusDataSet.push({"value":CandidatStatus.Applied});
          candidatesStatusDataSet.push({"value":CandidatStatus.Shortlisted});
        }
        else if(status === 'In Progress (Pending)'){
          candidatesStatusDataSet.push({"value":CandidatStatus.Offered});
        }
        else if(status === 'In Progress (Accepted)'){
          candidatesStatusDataSet.push({"value":CandidatStatus.Accepted});
        }
        else if(OrderStatus[OrderStatus.Filled] === status){
          candidatesStatusDataSet.push({"value":CandidatStatus.OnBoard});
          activeOrderStatus.push({"value":OrderStatus.InProgress, "name": PositionTrendTypeEnum.IN_PROGRESS})
          window.localStorage.setItem("candidatesOrderStatusListFromDashboard",JSON.stringify(activeOrderStatus));
        }
      }
      if(status !=  OrderStatus[OrderStatus.Open]){
        window.localStorage.setItem("candidateStatusListFromDashboard",JSON.stringify(candidatesStatusDataSet));
        this.dashboardService.redirectToUrlWithActivePositions('client/order-management', undefined, status);
      }
    }else if(this.chartData?.title == "Candidates for Active Positions" || this.chartData?.title == "Candidate Overall Status"){
        let candidatesDataset:any = [];
        let candidatesOrderDataSet = [];
        if(this.chartData?.title == "Candidates for Active Positions"){
          this.dashboardService.candidatesForActivePositions$.subscribe(data=>{
            candidatesDataset = data;
          }); 
        }else{
          this.dashboardService.candidatesOverallStatus$.subscribe(data=>{
            candidatesDataset = data;
          }); 
        }        

        let candidatesChartInfo = candidatesDataset.find((ele:any)=>ele.status == status);
        candidatesOrderDataSet.push({"value":OrderStatus.InProgress, "name": PositionTrendTypeEnum.IN_PROGRESS})
        if(candidatesChartInfo.applicantStatus === OrderStatus.Onboard){
          candidatesOrderDataSet.push({"value":OrderStatus.Filled, "name": PositionTrendTypeEnum.FILLED});
        }else if(candidatesChartInfo.applicantStatus === OrderStatus.Cancelled || candidatesChartInfo.applicantStatus === OrderStatus.Offboard){ // "Cancelled" "Offboard"
          candidatesOrderDataSet.push({"value":OrderStatus.Filled, "name": PositionTrendTypeEnum.FILLED});
          candidatesOrderDataSet.push({"value":OrderStatus.Closed, "name": PositionTrendTypeEnum.CLOSED});
        }
        window.localStorage.setItem("candidatesOrderStatusListFromDashboard",JSON.stringify(candidatesOrderDataSet));
        if (user?.businessUnitType != null && user?.businessUnitType == BusinessUnitType.Agency) {         
            this.dashboardService.redirectToUrlWithStatus('agency/order-management/',candidatesChartInfo.status);
        }else{
            this.dashboardService.redirectToUrlWithStatus('client/order-management/',candidatesChartInfo.status);
        }
        
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
}
