import { ChangeDetectorRef, Component, Input, Inject, ChangeDetectionStrategy } from '@angular/core';
import { Actions, Store } from '@ngxs/store';
import { OrgDetailsInfoModel } from '../../models/org-details-info.model';
import { DashboardService } from '../../services/dashboard.service';
import { GlobalWindow } from '@core/tokens';
import { LocalStorageStatus } from '@shared/enums/status';
import { UserState } from '../../../store/user.state';
import { BusinessUnitType } from '../../../shared/enums/business-unit-type';
import { AbstractPermissionGrid } from '@shared/helpers/permissions/abstract-permission-grid';
import { Timesheets } from 'src/app/modules/timesheets/store/actions/timesheets.actions';

@Component({
  selector: 'app-org-widget',
  templateUrl: './org-widget.component.html',
  styleUrls: ['./org-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrgWidgetComponent extends AbstractPermissionGrid {
  @Input() public isLoading: boolean;
  @Input() public isDarkTheme: boolean | false;
  @Input() public description: string;
  @Input() public chartData: OrgDetailsInfoModel | undefined;
  public countzero = "Ordercountzero";
  public isAgencyUser:boolean = false;
  private mousePosition = {
    x: 0,
    y: 0,
  };
  filterservice: any;

  constructor(private readonly dashboardService: DashboardService,
              private actions$: Actions, 
              private cdr: ChangeDetectorRef,
              protected override store: Store,
              @Inject(GlobalWindow) protected readonly globalWindow : WindowProxy & typeof globalThis) {
                super(store);
                const user = this.store.selectSnapshot(UserState.user);
                if (user?.businessUnitType != null && user?.businessUnitType == BusinessUnitType.Agency) {
                  this.isAgencyUser = true;
                } 
            }
  
  public defineMousePosition($event: MouseEvent): void {
    this.mousePosition.x = $event.screenX;
    this.mousePosition.y = $event.screenY;
  }
  public toSourceContent(orgname: string): void {
    if(orgname === LocalStorageStatus.OrdersforApproval){
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
    } else if(orgname === 'MissingCredentials'){
      this.dashboardService.redirectToUrl('agency/candidates');
    }
  }

  public toTimesheetcontent(orgId : number):void{
    this.globalWindow.localStorage.setItem("timeSheetMissing",JSON.stringify("Missing"));  
    this.dashboardService.redirectToUrlWithAgencyposition('agency/timesheets',orgId,"setOrg");
  }
}



