import { Component, OnInit, OnDestroy } from '@angular/core';
import { MenuSettings } from '@shared/models';
import { SetHeaderState } from '../../store/app.actions';
import { AbstractPermission } from '@shared/helpers/permissions';
import { AGENCYREPORTS_SETTINGS } from './agency-reports-menu.config';
import { filter, takeUntil, Subject } from 'rxjs';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
@Component({
  selector: 'app-agency-reports',
  templateUrl: './agency-reports.component.html',
  styleUrls: ['./agency-reports.component.scss']
})
export class AgencyReportsComponent extends AbstractPermission implements OnInit, OnDestroy {

  public sideMenuConfig: MenuSettings[] = [];

  private agencyReportSettings = AGENCYREPORTS_SETTINGS;
  constructor(protected override store: Store, private router: Router) {
    super(store);

    store.dispatch(new SetHeaderState({ title: 'Reports', iconName: 'pie-chart' }));
  }

  private unsubscribe$: Subject<void> = new Subject();

  override ngOnInit(): void {
    super.ngOnInit();   

      this.watchForPermissions();
    
  }
  private watchForPermissions(): void {
    const itemsWithoutPermissions = this.agencyReportSettings.filter((item: MenuSettings) => !item.permissionKeys).length;

    this.getPermissionStream()
      .pipe(
        filter(() => this.sideMenuConfig.length <= itemsWithoutPermissions),
        takeUntil(this.componentDestroy())
      )
      .subscribe(() => {
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

  override ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
