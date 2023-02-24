import { ChangeDetectorRef, Component, Input, Inject, ChangeDetectionStrategy } from '@angular/core';
import { Actions } from '@ngxs/store';
import { OrgDetailsInfoModel } from '../../models/org-details-info.model';
import { DashboardService } from '../../services/dashboard.service';
import { GlobalWindow } from '@core/tokens';

@Component({
  selector: 'app-org-widget',
  templateUrl: './org-widget.component.html',
  styleUrls: ['./org-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrgWidgetComponent {
  @Input() public isLoading: boolean;
  @Input() public isDarkTheme: boolean | false;
  @Input() public description: string;
  @Input() public chartData: OrgDetailsInfoModel | undefined;
  public countzero = "Ordercountzero";
  private mousePosition = {
    x: 0,
    y: 0,
  };

  constructor(private readonly dashboardService: DashboardService,private actions$: Actions, private cdr: ChangeDetectorRef,
              @Inject(GlobalWindow) protected readonly globalWindow : WindowProxy & typeof globalThis) {}
  
  public defineMousePosition($event: MouseEvent): void {
    this.mousePosition.x = $event.screenX;
    this.mousePosition.y = $event.screenY;
  }
  public toSourceContent(orgname: string): void {
    if(orgname === 'OrdersforApproval'){
      if(this.chartData?.pendingOrders == 0){
        this.globalWindow.localStorage.setItem("pendingApprovalOrders",JSON.stringify(this.countzero))
      } else {
        this.globalWindow.localStorage.setItem("pendingApprovalOrders",JSON.stringify(orgname));
      }
      this.dashboardService.redirectToUrl('client/order-management/');
    } else if(orgname === 'ManualInvoice'){
      this.dashboardService.redirectToUrl('client/invoices/');
      this.globalWindow.localStorage.setItem("orgmanualinvoicewidget",JSON.stringify(orgname));  
    } else if(orgname === 'pendingInvoice'){
      this.globalWindow.localStorage.setItem("pendingInvoiceApproval",JSON.stringify(orgname));  
      this.dashboardService.redirectToUrl('client/invoices/');
    } else if(orgname === 'Pending Timesheet'){
      this.dashboardService.redirectToUrl('client/timesheets/');
      this.globalWindow.localStorage.setItem("orgpendingwidget",JSON.stringify(orgname));  
    }
  }
}



