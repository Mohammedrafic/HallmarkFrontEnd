import { Component, Input, OnChanges, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Actions, ofActionDispatched } from '@ngxs/store';
import { AccumulationChartComponent as Pie } from '@syncfusion/ej2-angular-charts';
import { Subject, takeUntil } from 'rxjs';
import { ToggleSidebarState } from 'src/app/store/app.actions';
import { ChartAccumulation, DonutChartData } from '../../models/chart-accumulation-widget.model';

@Component({
  selector: 'app-accumulation-chart',
  templateUrl: './accumulation-chart.component.html',
  styleUrls: ['./accumulation-chart.component.scss'],
})
export class AccumulationChartComponent implements OnInit, OnChanges, OnDestroy {
  @Input('chartData') chart: ChartAccumulation;
  @ViewChild('pie') pie: Pie;
  public toggleLegend: number[] = [];
  public palette: string[] = ['#ECF2FF', '#C5D9FF', '#9EBFFF', '#6499FF'];
  public height = '35%';
  public tooltip = { enable: true };
  public datalabel = { visible: false };
  public chartData: DonutChartData[];
  public legendSettings: Object = {
    visible: false,
  };

  private unsubscribe$ = new Subject();

  constructor(private actions$: Actions) {}

  ngOnDestroy(): void {
    this.unsubscribe$.next(true);
    this.unsubscribe$.complete();
  }

  ngOnChanges(): void {
    this.chartData = [...this.chart.chartData];
  }

  ngOnInit(): void {
    this.actions$.pipe(ofActionDispatched(ToggleSidebarState), takeUntil(this.unsubscribe$)).subscribe(() => {
      setTimeout(() => {
        this.pie.refreshChart();
      }, 650);
    });
  }

  private onClickLegend(index: number): void {
    if (this.toggleLegend.includes(index)) {
      this.toggleLegend = this.toggleLegend.filter((item) => item !== index);
    } else {
      this.toggleLegend.push(index);
    }
    this.chartData = this.chart.chartData.filter((_, idx) => !this.toggleLegend.includes(idx));
  }

  onCheckboxChange(idx: number): void {
    this.onClickLegend(idx);
  }
}
