import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Actions, ofActionDispatched } from '@ngxs/store';
import { Subject, takeUntil } from 'rxjs';
import { ToggleSidebarState } from 'src/app/store/app.actions';

@Component({
  selector: 'app-invoices-chart',
  templateUrl: './invoices-chart.component.html',
  styleUrls: ['./invoices-chart.component.scss']
})
export class InvoicesChartComponent implements OnInit , OnChanges{
  @Input() public chartData: string | undefined;
  url: string;
  
  destroy: Subject<boolean> = new Subject();

  constructor(private actions$: Actions, private cdr: ChangeDetectorRef) {}
  
  ngOnDestroy(): void {
    this.destroy.next(true);
    this.destroy.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.error(changes)
    this.url = changes['chartData'].currentValue;
  }

  ngOnInit(): void {
    // temporary functionality to display  widget as an image to demo
    this.actions$.pipe(takeUntil(this.destroy),ofActionDispatched(ToggleSidebarState)).subscribe((isOpen) => {
      if (isOpen.payload) {
        setTimeout(() => {
          this.url = 'temporary-widget-invoices-collapsed';
          this.cdr.markForCheck();
        }, 400);
        console.error(this.url);
      } else {
        setTimeout(() => {
          this.url = 'temporary-widget-invoices';
          this.cdr.markForCheck();
        }, 400);
        console.error(this.url);
      }
    });
  }
}
