import { Component, OnInit, OnDestroy } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { AnalyticsMenuId } from '../../shared/constants/menu-config';
import { Menu, MenuItem } from '../../shared/models/menu.model';
import { UserState } from '../../store/user.state';
import { MenuSettings } from '@shared/models';
import { SetHeaderState } from '../../store/app.actions';
import { AbstractPermission } from '@shared/helpers/permissions';
import { OrganizationManagementState } from '../../organization-management/store/organization-management.state';
import { Organization } from '../../shared/models/organization.model';
import { AGENCYREPORTS_SETTINGS } from './agency-reports-menu.config';
import { filter, Observable, switchMap, takeUntil, Subject } from 'rxjs';
import { GetOrganizationById } from '../../admin/store/admin.actions';
@Component({
  selector: 'app-agency-reports',
  templateUrl: './agency-reports.component.html',
  styleUrls: ['./agency-reports.component.scss']
})
export class AgencyReportsComponent extends AbstractPermission implements OnInit, OnDestroy {

  @Select(UserState.lastSelectedOrganizationId)
  private organizationId$: Observable<number>;
  @Select(OrganizationManagementState.organization)
  private organization$: Observable<Organization>;

  public sideMenuConfig: MenuSettings[];

  private agencyReportSettings = AGENCYREPORTS_SETTINGS;
  private isIRPFlagEnabled = false;
  private isIRPForOrganizationEnabled = false;
  constructor(protected override store: Store) {
    super(store);

    store.dispatch(new SetHeaderState({ title: 'Reports', iconName: 'pie-chart' }));
  }

  private unsubscribe$: Subject<void> = new Subject();
  public isLoad: boolean = false;

  override ngOnInit(): void {
    super.ngOnInit();   

      this.startOrgIdWatching();
      this.setMenuConfig();
      this.watchForPermissions();
    
  }
  private watchForPermissions(): void {
    const itemsWithoutPermissions = this.agencyReportSettings.filter((item: MenuSettings) => !item.permissionKeys).length;

    this.getPermissionStream()
      .pipe(
        filter(() => this.sideMenuConfig.length <= itemsWithoutPermissions),
        takeUntil(this.componentDestroy())
      )
      .subscribe((permissions) => {
        this.userPermission = permissions;
        this.setMenuConfig();
      });
  }
  private setMenuConfig(): void {
    const agencyReportSettingsFinal =
        this.agencyReportSettings.filter((item) => !item.isIRPOnly);
    this.sideMenuConfig = this.checkValidPermissions(agencyReportSettingsFinal);
  }
  private startOrgIdWatching(): void {
    this.organizationId$
      .pipe(
        //switchMap((id) =>
        //  this.getOrganization(id)),
        takeUntil(this.componentDestroy())
      )
      .subscribe(() => {
        //this.checkOrgPreferences();
      });
  }
  private getOrganization(businessUnitId: number): Observable<void> {
    const id = businessUnitId || (this.store.selectSnapshot(UserState.user)?.businessUnitId as number);

    return this.store.dispatch(new GetOrganizationById(id));
  }

  override ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
