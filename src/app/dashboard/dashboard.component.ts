import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation, ChangeDetectionStrategy, ViewContainerRef, TemplateRef } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';

import { Select, Store } from '@ngxs/store';
import type { PanelModel, DashboardLayoutComponent } from '@syncfusion/ej2-angular-layouts';
import { Observable, takeUntil, startWith, distinctUntilChanged, switchMap, combineLatest, map, filter } from 'rxjs';
import isEqual from 'lodash/fp/isEqual';
import lodashMap from 'lodash/fp/map';

import { SetHeaderState } from '../store/app.actions';
import { DashboardService } from './services/dashboard.service';
import { GetDashboardData, SetPanels, SaveDashboard, ResetState, IsMobile } from './store/dashboard.actions';
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
import { GetAllOrganizationSkills } from '@organization-management/store/organization-management.actions';
import { DashboardFiltersModel } from './models/dashboard-filters.model';
import { PermissionTypes } from '@shared/enums/permissions-types.enum';

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
  @Select(DashboardState.isMobile) private readonly isMobile$: Observable<DashboardStateModel['isMobile']>;
  @Select(DashboardState.dashboardFiltersState) private readonly dashboardFiltersState$: Observable<DashboardFiltersModel>;

  @Select(UserState.lastSelectedOrganizationId) private readonly organizationId$: Observable<UserStateModel['lastSelectedOrganizationId']>;
  @Select(UserState.lastSelectedOrganizationAgency) private readonly lastSelectedOrganizationAgency$: Observable<string>;
  @Select(UserState.currentUserPermissions) private readonly currentUserPermissions$: Observable<CurrentUserPermission[]>;

  private panelsAreDragged = false;
  private permissions: CurrentUserPermission[] = [];

  public widgetsData$: Observable<WidgetsDataModel>;
  public isOrganization$: Observable<boolean>;

  public readonly filtersGroup: FormGroup = this.getFiltersGroup();

  get hasOrderManagePermission(): boolean {
    const manageOrderPermissionId = PermissionTypes.CanOrganizationEditOrders;
    return this.permissions.map(permission => permission.permissionId).includes(manageOrderPermissionId);
  }

  get hasWidgetPermission(): boolean {
    const widgetPermissionId = PermissionTypes.DashboardWidgets;
    return this.permissions.map(permission => permission.permissionId).includes(widgetPermissionId);
  }

  constructor(
    private readonly store: Store,
    private readonly dashboardService: DashboardService,
    private readonly formBuilder: FormBuilder,
    private readonly breakpointObserver: BreakpointObserver
  ) {
    super();
    this.store.dispatch(new SetHeaderState({ title: 'Dashboard', iconName: 'home' }));
  }

  public ngOnInit(): void {
    this.isUserOrganization();
    this.initOrganizationChangeListener();
    this.getCurrentUserPermissions();
    this.subscribeOnPermissions();
    this.getDashboardFilterState();
  }

  private getCurrentUserPermissions(): void {
    this.store.dispatch(new GetCurrentUserPermissions());
  }

  private subscribeOnPermissions(): void {
    this.currentUserPermissions$.pipe(takeUntil(this.destroy$)).subscribe(permissions => this.permissions = permissions);
  }

  private isUserOrganization(): void {
    this.isOrganization$ = this.lastSelectedOrganizationAgency$.pipe(
      map((businessUnitType: string): boolean => {
        return businessUnitType !== BusinessUnitType[4];
      })
    );
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

  private getFiltersGroup(): FormGroup {
    return this.formBuilder.group({
      regionIds: [],
      locationIds: [],
      departmentsIds: [],
      skillIds: [],
    });
  }

  private initOrganizationChangeListener(): void {
    combineLatest([this.organizationId$, this.isOrganization$])
      .pipe(
        filter(([organizationId, isOrganization]: [number | null, boolean]) => !!organizationId && isOrganization),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.resetDashboardState();
        this.setWidgetsData();
        this.store.dispatch(new GetDashboardData());
        this.store.dispatch(new GetAllOrganizationSkills());
      });
  }

  private setWidgetsData(): void {
    const formChanges$ = this.filtersGroup.valueChanges.pipe(startWith(this.filtersGroup.value));
    const panels$ = this.getPanels$();

    this.widgetsData$ = combineLatest([panels$, formChanges$]).pipe(
      distinctUntilChanged(
        (previous: WidgetDataDependenciesAggregatedModel, current: WidgetDataDependenciesAggregatedModel) =>
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
        panel.id === WidgetTypeEnum.OPEN_POSITIONS
      ) {
        return { ...panel, sizeY: 0.3, maxSizeY: 0.3, minSizeY: 0.3 };
      } else {
        return { ...panel, sizeX: 1, sizeY: 1, maxSizeY: 1, maxSizeX: 1, minSizeY: 1, minSizeX: 1 };
      }
    }, panels);
  }

  private getDashboardFilterState(): void {
    this.dashboardFiltersState$.pipe(takeUntil(this.destroy$)).subscribe((filters: DashboardFiltersModel)=> {
      this.filtersGroup.reset();
      Object.entries(this.filtersGroup.controls).forEach(([field, control]) => control.setValue(filters[field as keyof DashboardFiltersModel] || []));
    });
  }
}
