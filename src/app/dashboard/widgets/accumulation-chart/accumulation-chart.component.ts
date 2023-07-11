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
    let Enumvalues: number;
    if (this.chartData?.title == "Candidate Overall Status") {
      //if (this.chartData?.title)
      if (status.toLowerCase() == CandidatStatus[CandidatStatus['Not Applied']].toLowerCase()) {
        Enumvalues = CandidatStatus['Not Applied'];
      }
      else if (status.toLowerCase() == CandidatStatus[CandidatStatus.Applied].toLowerCase()) {
        Enumvalues = CandidatStatus.Applied;
      }
      else if (status.toLowerCase() == CandidatStatus[CandidatStatus.Shortlisted].toLowerCase()) {
        Enumvalues = CandidatStatus.Shortlisted;
      }
      else if (status.toLowerCase() == CandidatStatus[CandidatStatus['Pre Offer Custom']].toLowerCase()) {
        Enumvalues = CandidatStatus['Pre Offer Custom'];
      }
      else if (status.toLowerCase() == CandidatStatus[CandidatStatus.Withdraw].toLowerCase()) {
        Enumvalues = CandidatStatus.Withdraw;
      }
      else if (status.toLowerCase() == CandidatStatus[CandidatStatus.Offered].toLowerCase()) {
        Enumvalues = CandidatStatus.Offered;
      }
      else if (status.toLowerCase() == CandidatStatus[CandidatStatus.BillRatePending].toLowerCase()) {
        Enumvalues = CandidatStatus.BillRatePending;
      }
      else if (status.toLowerCase() == CandidatStatus[CandidatStatus.OfferedBR].toLowerCase()) {
        Enumvalues = CandidatStatus.OfferedBR;
      }
      else if (status.toLowerCase() == CandidatStatus[CandidatStatus.Accepted].toLowerCase()) {
        Enumvalues = CandidatStatus.Accepted;
      }
      else if (status.toLowerCase() == CandidatStatus[CandidatStatus.OnBoard].toLowerCase()) {
        Enumvalues = CandidatStatus.OnBoard;
      }
      else if (status.toLowerCase() == CandidatStatus[CandidatStatus.End].toLowerCase()) {
        Enumvalues = CandidatStatus.End;
      }
      else if (status.toLowerCase() == CandidatStatus[CandidatStatus.Offboard].toLowerCase()) {
        Enumvalues = CandidatStatus.Offboard;
      }
      else if (status.toLowerCase() == CandidatStatus[CandidatStatus.Rejected].toLowerCase()) {
        Enumvalues = CandidatStatus.Rejected;
      }
      else if (status.toLowerCase() == CandidatStatus[CandidatStatus.Cancelled].toLowerCase()) {
        Enumvalues = CandidatStatus.Cancelled;
      }
      else {
        Enumvalues = 0;
      }
      if (Enumvalues > 0) {
        if (user?.businessUnitType != null && user?.businessUnitType == BusinessUnitType.Agency) {
          this.dashboardService.redirectToUrl('agency/candidate-details', Enumvalues, undefined);
        } else {
          this.dashboardService.redirectToUrl('client/candidate-details', Enumvalues, undefined);
        }
      }
      else {
        this.store.dispatch(new ShowToast(MessageTypes.Warning, CANDIDATE_STATUS));
      }
    } else if (this.chartData?.title == "Active Positions") {
      if (user?.businessUnitType != null && user?.businessUnitType == BusinessUnitType.Agency) {
        this.dashboardService.redirectToUrl('agency/candidate-details');
      } else {
        this.dashboardService.redirectToUrl('client/order-management', undefined, status);
      }
    }else if(this.chartData?.title == "Candidates for Active Positions"){
        let dataset:any = [];
        this.dashboardService.candidatesForActivePositions$.subscribe(data=>{
          dataset = data;
        });        
        let chartInfo = dataset.find((ele:any)=>ele.status == status);
        if(chartInfo.applicantStatus === OrderStatus.Onboard){
          this.dashboardService.redirectToUrlWithCandidateStatus('client/order-management/', OrderStatus.InProgress, 'In Progress',chartInfo.applicantStatus,chartInfo.status, OrderStatus.Filled,'Filled');
        }else{
          this.dashboardService.redirectToUrlWithCandidateStatus('client/order-management/', OrderStatus.InProgress, 'In Progress',chartInfo.applicantStatus,chartInfo.status);
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
