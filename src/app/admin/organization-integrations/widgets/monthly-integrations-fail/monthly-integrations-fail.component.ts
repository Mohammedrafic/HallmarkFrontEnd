import { Component, Input, OnInit, ChangeDetectionStrategy, OnChanges, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, distinctUntilChanged,of } from 'rxjs';

import { map, takeUntil, takeWhile } from 'rxjs/operators';

import { LegendPositionEnum } from '../../../../dashboard/enums/legend-position.enum';
import { ChartAccumulation, DonutChartData, } from '../../../../dashboard/models/chart-accumulation-widget.model';
import { WidgetLegengDataModel } from '../../../../dashboard/models/widget-legend-data.model';
import { Select, Store } from '@ngxs/store';
import { AbstractSFComponentDirective } from '../../../../shared/directives/abstract-sf-component.directive';
import { ChartComponent } from '@syncfusion/ej2-angular-charts';
import { IntegrationsState } from '../../../store/integrations.state';
import { IntegraionFailFilterDto } from '../../../../shared/models/integrations.model';
import { GetLast12MonthFailIntegrationRuns } from '../../../store/integrations.actions';

@Component({
    selector: 'app-monthly-failure-integrations',
    templateUrl: './monthly-integrations-fail.component.html',
    styleUrls: ['./monthly-integrations-fail.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
  })
export class MonthlyIntegrationsFailureComponent extends AbstractSFComponentDirective<ChartComponent> implements OnChanges, OnInit, OnDestroy {
   
    public isLoading: boolean;
    public isDarkTheme: boolean;
    public description: string;
    public averageFlag: boolean = false;
 
   public toggleLegend: number[] = [];
   public failfilteredChartData$: Observable<DonutChartData[]>;
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

 
   @Select(IntegrationsState.failureChartAccumulation)
   integrationsmonthlyFailureLast12Months$: Observable<ChartAccumulation>;
 
   private isAlive = true;
    
   ngOnInit(): void {
     this.datalabel = { visible: true, position: 'Outside' };
      this.getFailedFilteredChartData()
   }
   public override ngOnDestroy(): void {
     this.isAlive = false;
   }
   public ngOnChanges(): void {
   }
 
   private getFailedFilteredChartData(){
     let inputPayload = new IntegraionFailFilterDto();
     inputPayload.organizationFilter = [{ departmentsIds: [], locationIds: [], regionIds: [], organizationId: 16 }];
     this.store.dispatch(new GetLast12MonthFailIntegrationRuns(inputPayload));
   }
  }