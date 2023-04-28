import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation, ChangeDetectionStrategy, ViewContainerRef, TemplateRef } from '@angular/core';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';

import { Select, Store } from '@ngxs/store';
import type { PanelModel, DashboardLayoutComponent } from '@syncfusion/ej2-angular-layouts';
import { Observable, takeUntil, distinctUntilChanged, switchMap, combineLatest, map, filter, BehaviorSubject, tap } from 'rxjs';
import isEqual from 'lodash/fp/isEqual';
import lodashMap from 'lodash/fp/map';

import { SetHeaderState } from '../store/app.actions';
import { DashboardService } from './services/dashboard.service';
import { GetDashboardData, SetPanels, SaveDashboard, ResetState, IsMobile, GetAllSkills, SetDashboardWidgetFilter } from './store/dashboard.actions';
import { DashboardState, DashboardStateModel } from './store/dashboard.state';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { WidgetDataDependenciesAggregatedModel } from './models/widget-data-dependencies-aggregated.model';
import { WidgetTypeEnum } from './enums/widget-type.enum';
import { UserState, UserStateModel } from 'src/app/store/user.state';
import { WidgetOptionModel } from './models/widget-option.model';
import { widgetTypeToConfigurationMapper } from './constants/widget-type-to-configuration-mapper';
import { WidgetToggleModel } from './models/widget-toggle.model';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { DashboardWidgetsComponent } from './dashboard-widgets/dashboard-widgets.component';
import type { WidgetsDataModel } from './models/widgets-data.model';
import { GetCurrentUserPermissions } from '../store/user.actions';
import { CurrentUserPermission } from '@shared/models/permission.model';
import { PermissionTypes } from '@shared/enums/permissions-types.enum';
import { WIDGET_PERMISSION_TYPES } from './constants/widget-permissions-types';
import { SecurityState } from '../security/store/security.state';
import { GetOrganizationsStructureAll } from '../security/store/security.actions';
import { Skill } from '@shared/models/skill.model';
import { FilteredDataByOrganizationId } from './models/group-by-organization-filter-data.model';
import { OrganizationStructure } from '@shared/models/organization.model';
import { FilterColumnTypeEnum } from './enums/dashboard-filter-fields.enum';
import { FilteredItem } from '@shared/models/filter.model';
import { DashboartFilterDto } from './models/dashboard-filter-dto.model';
import { User } from '@shared/models/user.model';
import { AllOrganizationsSkill } from './models/all-organization-skill.model';
import { AppState } from '../store/app.state';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['dashboard.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent extends DestroyableDirective implements OnInit, OnDestroy {
  @ViewChild(DashboardWidgetsComponent, { static: false }) dashboardWidgetsComponent: DashboardWidgetsComponent;

  @ViewChild('widgetsTemplate', { read: TemplateRef }) widgetsContentRef: TemplateRef<DashboardWidgetsComponent>;
  @ViewChild('outlet', { read: ViewContainerRef }) outletRef: ViewContainerRef;

  @Select(DashboardState.dashboardPanels) public readonly panels$: Observable<DashboardStateModel['panels']>;
  @Select(DashboardState.selectedWidgets) public readonly selectedWidgets$: Observable<WidgetTypeEnum[]>;
  @Select(DashboardState.widgets) public readonly widgets$: Observable<DashboardStateModel['widgets']>;
  @Select(DashboardState.isDashboardLoading) public readonly isLoading$: Observable<DashboardStateModel['isDashboardLoading']>;
  @Select(DashboardState.isMobile) public readonly isMobile$: Observable<DashboardStateModel['isMobile']>;
  @Select(DashboardState.getTimeSelection) public readonly timeSelection$: Observable<DashboardStateModel['positionTrendTimeSelection']>
  @Select(DashboardState.filteredItems) public readonly fileredItem$: Observable<DashboardStateModel['filteredItems']>;
  @Select(DashboardState.getAllOrganizationSkills) public readonly allOrganizationsSkills$: Observable<AllOrganizationsSkill[]>;

  @Select(UserState.currentUserPermissions) private readonly currentUserPermissions$: Observable<CurrentUserPermission[]>;
  @Select(UserState.organizationStructure) private readonly organizationStructure$: Observable<OrganizationStructure>;
  @Select(UserState.user) public readonly user$: Observable<User | null>;

  @Select(SecurityState.organisations) public readonly allOrganizations$: Observable<UserStateModel['organizations']>;

  @Select(AppState.isDarkTheme)
  isDarkTheme$: Observable<boolean>;

  private panelsAreDragged = false;
  private readonly filterData$: BehaviorSubject<DashboartFilterDto> = new BehaviorSubject<DashboartFilterDto>({organizationFilter: []});
  public readonly userIsAdmin$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public hasWidgetPermission: boolean = true;
  public hasOrderManagePermission: boolean = true;
  public hasOrderCreatePermission: boolean = true;

  public widgetsData$: Observable<WidgetsDataModel>;
  public UserType:number;
  constructor(
    private readonly store: Store,
    private readonly dashboardService: DashboardService,
    private readonly breakpointObserver: BreakpointObserver
  ) {
    super();
    this.store.dispatch(new SetHeaderState({ title: 'Dashboard', iconName: 'home' }));
  }

  public ngOnInit(): void {
    this.getAdminOrganizationsStructureAll();
    this.getCurrentUserPermissions();
    this.subscribeOnPermissions();
    this.getDashboardFilterState();
    this.setWidgetsData();
    this.setWidgetFilter();
    this.store.dispatch(new GetDashboardData());
    this.store.dispatch(new GetAllSkills());
    const user = this.store.selectSnapshot(UserState.user);
    if (user?.businessUnitType === BusinessUnitType.Agency) {
      this.UserType=BusinessUnitType.Agency
    }
    else{
      this.UserType=0;
    }

  }
  setWidgetFilter() {
    this.filterData$.pipe(
      takeUntil(this.destroy$),
      tap((value) =>
      this.store.dispatch(new SetDashboardWidgetFilter(value)))
    ).subscribe();
  }

  private getAdminOrganizationsStructureAll(): void {
    this.user$.pipe(takeUntil(this.destroy$), filter(Boolean)).subscribe((user: User) => {
      const userIsAdmin = user.businessUnitType === BusinessUnitType.MSP || user.businessUnitType === BusinessUnitType.Hallmark;
      this.userIsAdmin$.next(userIsAdmin);

      if (user && userIsAdmin) {
        this.store.dispatch(new GetOrganizationsStructureAll(user.id));
      }
    });
  }

  private getCurrentUserPermissions(): void {
    this.store.dispatch(new GetCurrentUserPermissions());
  }

  private subscribeOnPermissions(): void {
    this.currentUserPermissions$
      .pipe(
        takeUntil(this.destroy$),
        filter((permissions) => !!permissions.length),
        map((permissions) => permissions.map((permission) => permission.permissionId))
      )
      .subscribe((permissionsIds: number[]) => {
        this.hasWidgetPermission = WIDGET_PERMISSION_TYPES.map((id) => this.hasPermission(permissionsIds, id)).includes(true);
        this.hasOrderManagePermission = this.hasPermission(permissionsIds, PermissionTypes.CanOrganizationEditOrders);
        this.hasOrderCreatePermission = this.hasPermission(permissionsIds, PermissionTypes.CanCreateOrder);
      });
  }

  private hasPermission(permissions: number[], id: number): boolean{
    return permissions.includes(id);
  }

  private resetDashboardState(): void {
    this.store.dispatch(new ResetState());
  }

  public override ngOnDestroy(): void {
    super.ngOnDestroy();
    this.resetDashboardState();
  }

  public dashboardCreatedHandler(): void {
    this.initViewChangesListener();
    this.getIsDashboardMobileView();
  }

  public handleWidgetToggleEvent({ widget, isSelected }: WidgetToggleModel): void {
    isSelected ? this.addNewWidget(widget) : this.removeWidget(widget);
  }

  private get dashboardSFComponent(): DashboardLayoutComponent {
    return this.dashboardWidgetsComponent.sfComponent;
  }

  private get dashboardSFComponentSerialized(): PanelModel[] {
    return this.dashboardSFComponent.serialize();
  }

  private addNewWidget(widget: WidgetOptionModel): void {
    const widgetConfiguration = widgetTypeToConfigurationMapper[widget.id];

    if (!widgetConfiguration) return;

    const newPanel = { ...widgetConfiguration, id: widget.id, row: 0, col: 0 };
    const updatePanelsList = [...this.dashboardSFComponentSerialized, newPanel];

    this.saveDashboard(updatePanelsList);
    this.reRenderDashboard();
  }

  private reRenderDashboard(): void {
    /* due to an error in Syncfusion library, it is necessary to rerender dashboard
      after adding a new panel if panels were dragged before that */
    if (this.panelsAreDragged) {
      this.outletRef.clear();
      this.outletRef.createEmbeddedView(this.widgetsContentRef);
      this.panelsAreDragged = false;
    }
  }

  private removeWidget(widget: WidgetOptionModel): void {
    const updatePanelsList = this.dashboardSFComponentSerialized.filter((panel: PanelModel) => panel.id !== widget.id);

    this.saveDashboard(updatePanelsList);
  }

  private saveDashboard(panelsList: PanelModel[]): void {
    this.store.dispatch(new SaveDashboard(panelsList));
  }

  public moveDashboardPanel(): void {
    this.saveDashboard(this.dashboardSFComponentSerialized);
    this.panelsAreDragged = true;
  }

  private setWidgetsData(): void {
    const panels$ = this.getPanels$();

    this.widgetsData$ = combineLatest([panels$, this.filterData$, this.timeSelection$]).pipe(
      distinctUntilChanged(
        (previous, current) =>
          isEqual(previous, current)
      ),
      switchMap((data: WidgetDataDependenciesAggregatedModel) => this.dashboardService.getWidgetsAggregatedData(data))
    );
  }

  private getPanels$(): Observable<PanelModel[]> {
    return this.panels$.pipe(
      distinctUntilChanged((previous: PanelModel[], current: PanelModel[]) =>
        isEqual(this.getPanelsIds(previous), this.getPanelsIds(current))
      )
    );
  }

  private getPanelsIds(panels: PanelModel[]): string[] {
    return lodashMap((panel: PanelModel) => panel.id as string, panels);
  }

  private getIsDashboardMobileView(): void {
    this.dashboardSFComponent.mediaQuery = 'max-width: 640px';
    this.breakpointObserver
      .observe([`(${this.dashboardSFComponent.mediaQuery})`])
      .pipe(map((breakpointState: BreakpointState) => breakpointState.matches))
      .subscribe((isMobile) => this.store.dispatch(new IsMobile(isMobile)));
  }

  private initViewChangesListener() {
    combineLatest([this.getPanels$(), this.isMobile$])
      .pipe(
        distinctUntilChanged((previous, current) => isEqual(previous, current)),
        takeUntil(this.destroy$)
      )
      .subscribe(([panels, isMobile]: [PanelModel[], boolean]) => {
        const updatedPanels = isMobile ? this.getUpdatePanelsForMobileView(panels) : panels;
        this.store.dispatch(new SetPanels(updatedPanels));
      });
  }

  private getUpdatePanelsForMobileView(panels: PanelModel[]): PanelModel[] {
    return lodashMap((panel: PanelModel) => {
      if (
        panel.id === WidgetTypeEnum.FILLED_POSITIONS ||
        panel.id === WidgetTypeEnum.IN_PROGRESS_POSITIONS ||
        panel.id === WidgetTypeEnum.OPEN_POSITIONS || 
        panel.id === WidgetTypeEnum.Candidate_Applied_In_Last_N_Days ||
        panel.id === WidgetTypeEnum.LTA_ORDER_ENDING
      ) {
        return { ...panel, sizeY: 0.3, maxSizeY: 0.3, minSizeY: 0.3 };
      } else {
        return { ...panel, sizeX: 1, sizeY: 1, maxSizeY: 1, maxSizeX: 1, minSizeY: 1, minSizeX: 1 };
      }
    }, panels);
  }

  private getDashboardFilterState(): void {
    combineLatest([this.fileredItem$, this.userIsAdmin$, this.organizationStructure$]).pipe(
        distinctUntilChanged((previous, current) => isEqual(previous, current)),
        takeUntil(this.destroy$)
      )
      .subscribe(([filteredItems, userIsAdmin, orgStructure]) => {
        if (userIsAdmin) {
          const organizationFilter: FilteredDataByOrganizationId[] = filteredItems
            .filter((item) => item.column === FilterColumnTypeEnum.ORGANIZATION)
            .map((item) => new FilteredDataByOrganizationId(item.value));

          this.groupFilterDataByOrganization(filteredItems, organizationFilter);

        } else {
          if(!orgStructure) return;
          const organizationFilter: FilteredDataByOrganizationId[] = [new FilteredDataByOrganizationId(orgStructure.organizationId)];
          this.groupFilterDataByOrganization(filteredItems, organizationFilter);
        }
      });
  }

  private groupFilterDataByOrganization(filteredItems: FilteredItem[], organizationFilter: FilteredDataByOrganizationId[]) {
    const skillIds: Skill[] = [];

    filteredItems.forEach((item) => {
      if(item.column === FilterColumnTypeEnum.ORGANIZATION) return;

      if(item.column === FilterColumnTypeEnum.SKILL) {
        skillIds.push(item.value);
        return;
      }

      if (item.organizationId) {
        const organization = organizationFilter.find((organization) => organization.organizationId === item.organizationId);
        organization && (organization[item.column as keyof FilteredDataByOrganizationId] as number[]).push(item.value);
        return;
      }

      (organizationFilter[0][item.column as keyof FilteredDataByOrganizationId] as number[]).push(item.value);
    })
    this.filterData$.next({ organizationFilter, skillIds });
  }
}
