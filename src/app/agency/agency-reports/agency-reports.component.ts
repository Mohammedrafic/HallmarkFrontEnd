import { Component, OnInit, OnDestroy } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { UserState } from '../../store/user.state';
import { MenuSettings } from '@shared/models';
import { SetHeaderState } from '../../store/app.actions';
import { AbstractPermission } from '@shared/helpers/permissions';
import { AGENCYREPORTS_SETTINGS } from './agency-reports-menu.config';
import { filter, Observable, switchMap, takeUntil, Subject } from 'rxjs';
import { GetOrganizationById } from '../../admin/store/admin.actions';
import { Router } from '@angular/router';
@Component({
  selector: 'app-agency-reports',
  templateUrl: './agency-reports.component.html',
  styleUrls: ['./agency-reports.component.scss']
})
export class AgencyReportsComponent extends AbstractPermission implements OnInit, OnDestroy {

  @Select(UserState.lastSelectedOrganizationId)
  private organizationId$: Observable<number>;

  public sideMenuConfig: MenuSettings[] = [];

  private agencyReportSettings = AGENCYREPORTS_SETTINGS;
  constructor(protected override store: Store, private router: Router) {
    super(store);

    store.dispatch(new SetHeaderState({ title: 'Reports', iconName: 'pie-chart' }));
  }

  private unsubscribe$: Subject<void> = new Subject();

  override ngOnInit(): void {
    super.ngOnInit();   

      this.startOrgIdWatching();
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
    if (this.sideMenuConfig.length == 0) {
      this.router.navigate(['/']);
    }
  }
  private startOrgIdWatching(): void {
    this.organizationId$
      .pipe(
        switchMap((id) =>
          this.getOrganization(id)),
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
