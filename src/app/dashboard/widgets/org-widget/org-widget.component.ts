import { ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { Actions, ofActionDispatched } from '@ngxs/store';
import { Subject, takeUntil } from 'rxjs';
import { OrgDetailsInfoModel } from '../../models/org-details-info.model';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-org-widget',
  templateUrl: './org-widget.component.html',
  styleUrls: ['./org-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrgWidgetComponent implements OnInit {
  @Input() public isLoading: boolean;
  @Input() public isDarkTheme: boolean | false;
  @Input() public description: string;
  @Input() public chartData: OrgDetailsInfoModel | undefined;
  private mousePosition = {
    x: 0,
    y: 0,
  };

  constructor(private readonly dashboardService: DashboardService,private actions$: Actions, private cdr: ChangeDetectorRef) {}
  
  ngOnChanges(): void {
    console.log(this.chartData,"chartdata");
  }

  public defineMousePosition($event: MouseEvent): void {
    this.mousePosition.x = $event.screenX;
    this.mousePosition.y = $event.screenY;
  }
  ngOnInit(): void {
  }
  public toSourceContent(orgname: string): void {
    if(orgname === 'Order'){
      this.dashboardService.redirectToUrl('client/order-management/');
    } else if(orgname === 'ManualInvoice'){
      this.dashboardService.redirectToUrl('client/invoices/');
    } else if(orgname === 'pendingInvoice'){
      this.dashboardService.redirectToUrl('client/invoices/');
    } else if(orgname === 'Timesheet'){
      this.dashboardService.redirectToUrl('client/timesheets/');
    }
  }
}
