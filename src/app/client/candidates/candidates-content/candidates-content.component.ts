import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { SetHeaderState, ShowExportDialog, ShowFilterDialog } from 'src/app/store/app.actions';
import { Observable, Subject, takeUntil } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { ExportedFileType } from '@shared/enums/exported-file-type';
import { 
  AbstractGridConfigurationComponent,
} from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { TAB_CANDIDATES } from '@client/candidates/candidates-content/candidates.constant';
import { TabConfig } from '../interface';
import { UserState } from 'src/app/store/user.state';
import { GetOrganizationById } from '@organization-management/store/organization-management.actions';
import { OrganizationManagementState } from '@organization-management/store/organization-management.state';
import { UserPermissions } from '@core/enums';
import { Permission } from '@core/interface';
import { AppState } from 'src/app/store/app.state';
import { BreakpointObserverService } from '@core/services';

@Component({
  selector: 'app-candidates-content',
  templateUrl: './candidates-content.component.html',
  styleUrls: ['./candidates-content.component.scss'],
})
export class CandidatesContentComponent extends AbstractGridConfigurationComponent implements OnInit, OnDestroy {
  public includeDeployedCandidates$: Subject<boolean> = new Subject<boolean>();
  public filteredItems$ = new Subject<number>();
  public exportUsers$ = new Subject<ExportedFileType>();
  public search$ = new Subject<string>();
  public activeTabIndex: number;
  public isIRP = false;
  public preferencesLoaded = false;
  public readonly tabConfig: TabConfig[] = TAB_CANDIDATES;
  public readonly userPermissions = UserPermissions;
  public credEndDate: any;
  public credStartDate: any;
  public credType: any;
  public isMobile = false;
  public isSmallDesktop = false;
  public redirectedFromDashboard : any;
  
  public importDialogEvent: Subject<boolean> = new Subject<boolean>();

  @Select(UserState.lastSelectedOrganizationId)
  private organizationId$: Observable<number>;

  @Select(UserState.userPermission)
  currentUserPermissions$: Observable<Permission>;

  private unsubscribe$: Subject<void> = new Subject();

  constructor(
    private store: Store,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private breakpointService: BreakpointObserverService,
  ) {
    super();
    store.dispatch(new SetHeaderState({ title: 'Employee List', iconName: 'users' }));
    const routerState = this.router.getCurrentNavigation()?.extras?.state;
    this.credStartDate = routerState?.['startDate'];
    this.credEndDate = routerState?.['endDate'];
    this.credType = routerState?.['type'];
    this.redirectedFromDashboard = routerState?.['redirectedFromDashboard'];
  }

  ngOnInit(): void {
    this.getDeviceScreen();
    this.startOrgIdWatching();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public onSwitcher(event: { checked: boolean }): void {
    this.includeDeployedCandidates$.next(event.checked);
  }

  public handleChangeTab(tabIndex: number): void {
    this.activeTabIndex = tabIndex;
  }

  public showFilters(): void {
    this.store.dispatch(new ShowFilterDialog(true));
  }

  public navigateToCandidateForm(): void {
    this.router.navigate(['./add'], { relativeTo: this.route });
  }

  public override customExport(): void {
    this.store.dispatch(new ShowExportDialog(true));
  }

  public override defaultExport(fileType: ExportedFileType): void {
    this.exportUsers$.next(fileType);
  }

  private startOrgIdWatching(): void {
    this.organizationId$.pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe(id => {
      this.getOrganization(id);
    });
  }

  private getOrganization(businessUnitId: number) {
    const id = businessUnitId || this.store.selectSnapshot(UserState.user)?.businessUnitId as number;

    this.preferencesLoaded = false;
    this.store.dispatch(new GetOrganizationById(id)).pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe(() => {
      this.checkOrgPreferences();
    });
  }

  private checkOrgPreferences(): void {
    const { isIRPEnabled } =
      this.store.selectSnapshot(OrganizationManagementState.organization)?.preferences || {};

    this.isIRP = !!isIRPEnabled && this.store.selectSnapshot(AppState.isIrpFlagEnabled);
    this.preferencesLoaded = true;
    this.cdr.markForCheck();
  }

  public addIRPCandidate(): void {
    this.navigateToCandidateForm();
  }

  private getDeviceScreen(): void {
    this.breakpointService
      .getBreakpointMediaRanges()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((screen) => {
        this.isMobile = screen.isMobile;
        this.isSmallDesktop = screen.isDesktopSmall;
      });
  }

  public openImportDialog(): void {
    this.importDialogEvent.next(true);
  }
  public override updatePage(clearedFilters?: boolean): void {
    // this.getOrders(clearedFilters);
  }
}
