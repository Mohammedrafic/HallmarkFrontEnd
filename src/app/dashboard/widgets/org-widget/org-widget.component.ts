import { ChangeDetectorRef, Component, Input, Inject, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { Actions, Select, Store } from '@ngxs/store';
import { OrgDetailsInfoModel } from '../../models/org-details-info.model';
import { DashboardService } from '../../services/dashboard.service';
import { GlobalWindow } from '@core/tokens';
import { LocalStorageStatus } from '@shared/enums/status';
import { UserState } from '../../../store/user.state';
import { BusinessUnitType } from '../../../shared/enums/business-unit-type';
import { AbstractPermissionGrid } from '@shared/helpers/permissions/abstract-permission-grid';
import { AppState } from 'src/app/store/app.state';
import { OrganizationManagementState } from '@organization-management/store/organization-management.state';
import { Observable, filter, takeUntil } from 'rxjs';
import { Organization } from '@shared/models/organization.model';
import { SelectedSystemsFlag } from '@shared/components/credentials-list/interfaces';
import { SelectedSystems } from '@shared/components/credentials-list/constants';
import { GetOrganizationById } from '@organization-management/store/organization-management.actions';
import { DASHBOARD_FILTER_STATE } from '@shared/constants';
import { SetLastSelectedOrganizationAgencyId } from 'src/app/store/user.actions';
import { TakeUntilDestroy } from '@core/decorators';

@Component({
  selector: 'app-org-widget',
  templateUrl: './org-widget.component.html',
  styleUrls: ['./org-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
@TakeUntilDestroy
export class OrgWidgetComponent extends AbstractPermissionGrid implements OnDestroy {
  @Input() public isLoading: boolean;
  @Input() public isDarkTheme: boolean | false;
  @Input() public description: string;
  @Input() public chartData: OrgDetailsInfoModel | undefined;
   @Select(OrganizationManagementState.organization)
  public readonly organization$: Observable<Organization>;
  public selectedSystem: SelectedSystemsFlag = SelectedSystems;
  public countzero = "Ordercountzero";
  public isAgencyUser: boolean = false;
  public isOrgUser: boolean = false;
  public isIRPEnabledOrg: boolean = this.store.selectSnapshot(AppState.isIrpFlagEnabled);
  private mousePosition = {
    x: 0,
    y: 0,
  };
  filterservice: any;
  protected componentDestroy: () => Observable<unknown>;

  constructor(private readonly dashboardService: DashboardService,
    private actions$: Actions,
    private cdr: ChangeDetectorRef,
    protected override store: Store,
    @Inject(GlobalWindow) protected readonly globalWindow: WindowProxy & typeof globalThis) {
    super(store);
    const user = this.store.selectSnapshot(UserState.user);
    if (user?.businessUnitType != null && user?.businessUnitType == BusinessUnitType.Agency) {
      this.isAgencyUser = true;
    }
    if(user?.businessUnitType != null && user?.businessUnitType == BusinessUnitType.Organization){
      this.store.dispatch(new GetOrganizationById(this.store.selectSnapshot(UserState.user)?.businessUnitId as number));
      this.getOrganizagionData();
      this.isOrgUser =true
    }
  }

  ngOnDestroy(): void {}

  public defineMousePosition($event: MouseEvent): void {
    this.mousePosition.x = $event.screenX;
    this.mousePosition.y = $event.screenY;
  }
  public toSourceContent(orgname: string): void {
    let lastSelectedOrganizationId = window.localStorage.getItem("lastSelectedOrganizationId");
    let filteredList = JSON.parse(window.localStorage.getItem(DASHBOARD_FILTER_STATE) as string) || [];
    if(filteredList.length > 0){
      let organizations = filteredList.filter((ele:any)=>ele.column == "organizationIds").sort((a:any,b:any)=> a.value - b.value);
      if(organizations.length > 0 && organizations[0].value != lastSelectedOrganizationId){
        this.store.dispatch(
          new SetLastSelectedOrganizationAgencyId({
            lastSelectedAgencyId: null,
            lastSelectedOrganizationId: organizations[0].value
          })
        );
      }
    }
    if (orgname === LocalStorageStatus.OrdersforApproval) {
      if (this.chartData?.pendingOrders == 0) {
        this.globalWindow.localStorage.setItem("pendingApprovalOrders", JSON.stringify(this.countzero))
      } else {
        this.globalWindow.localStorage.setItem("pendingApprovalOrders", JSON.stringify(orgname));
      }
      this.dashboardService.redirectToUrl('client/order-management/');
    } else if (orgname === 'ManualInvoice') {
      this.dashboardService.redirectToUrl('client/invoices/');
      this.globalWindow.localStorage.setItem("orgmanualinvoicewidget", JSON.stringify(orgname));
    } else if (orgname === 'pendingInvoice') {
      this.globalWindow.localStorage.setItem("pendingInvoiceApproval", JSON.stringify(orgname));
      this.dashboardService.redirectToUrl('client/invoices/');
    } else if (orgname === 'Pending Timesheet') {
      this.dashboardService.redirectToUrl('client/timesheets/');
      this.globalWindow.localStorage.setItem("orgpendingwidget", JSON.stringify(orgname));
    } else if(orgname =='NoOfLongTermOrders'){
      this.dashboardService.redirectToUrl('client/order-management/');
      this.globalWindow.localStorage.setItem("ISIrpEnabled", JSON.stringify(true));
    } else if(orgname =='NoOfUnAssignedEmployee'){
      this.dashboardService.redirectToUrl('analytics/staff-list/');
      this.globalWindow.localStorage.setItem("unassignedemployeecountwidget", JSON.stringify(true));
    } else if(orgname =='Unassignedworkcommitment'){
      this.dashboardService.redirectToUrl('client/candidates/');
      this.globalWindow.localStorage.setItem("unassignedworkcommitment", JSON.stringify(true));
    }
  }

  public toTimesheetcontent(orgId: number): void {
    this.globalWindow.localStorage.setItem("timeSheetMissing", JSON.stringify("Missing"));
    this.dashboardService.redirectToUrlWithAgencyposition('agency/timesheets', orgId, "setOrg");
  }
  private getOrganizagionData(): void {
    this.organization$
      .pipe(
        filter(Boolean),
        takeUntil(this.componentDestroy())
      ).subscribe((organization: Organization) => {
        const isOrgUser = this.store.selectSnapshot(UserState.user)?.businessUnitType === BusinessUnitType.Organization;
        this.selectedSystem = {
          isIRP: !!organization.preferences.isIRPEnabled,
          isVMS: !!organization.preferences.isVMCEnabled,
        };
      });
  }
}



