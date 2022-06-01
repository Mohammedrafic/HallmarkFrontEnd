import { Component, Input, OnChanges, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Actions, ofActionDispatched } from '@ngxs/store';
import { ILegendRenderEventArgs, IMouseEventArgs } from '@syncfusion/ej2-angular-charts';
import { Subject, takeUntil } from 'rxjs';
import { ToggleSidebarState } from 'src/app/store/app.actions';

@Component({
  selector: 'app-accumulation-chart',
  templateUrl: './accumulation-chart.component.html',
  styleUrls: ['./accumulation-chart.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AccumulationChartComponent implements OnInit, OnChanges, OnDestroy {
  @Input() chartData: any;
  @ViewChild('pie')
  public pie: AccumulationChartComponent;
  sidebarIsOpened = false;
  public palette: string[];
  public height = '65%';
  public tooltip = { enable: true };
  public datalabel = { visible: false };
  public legendSettings: Object = {
    visible: true,
    toggleVisibility: false,
    height: '55%',
    textWrap: 'Wrap',
    maximumLabelWidth: 400,
    position: 'Bottom',
    alignment: 'Near',
  };

  private unsubscribe$ = new Subject();
  constructor(private actions$: Actions) {}

  ngOnDestroy(): void {
    this.unsubscribe$.next(true);
    this.unsubscribe$.complete();
  }

  ngOnChanges(): void {}

  pointClick(event: any) {
    console.log('Click', event);
  }

  clickD(event: any) {
    console.log('click', event);
  }

  ngOnInit(): void {
    this.palette = ['#6499FF', '#9EBFFF', '#C5D9FF', '#ECF2FF'];
    this.actions$.pipe(ofActionDispatched(ToggleSidebarState), takeUntil(this.unsubscribe$)).subscribe((data) => {
      setTimeout(() => (this.pie.height = data.payload ? '53%' : '65%'), 500)});
  }

  public chartMouseClick(args: IMouseEventArgs): void {
    console.log(args);
    console.log(this.pie);
  }

  legendRender(event: ILegendRenderEventArgs) {
    console.log(event);
    event.fill = '#FF5858';
  }
}
