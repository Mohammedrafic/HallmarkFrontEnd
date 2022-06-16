import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';

import { Select, Store } from '@ngxs/store';
import type { PanelModel } from '@syncfusion/ej2-angular-layouts';
import { Observable, takeUntil, startWith, distinctUntilChanged, switchMap, combineLatest, map } from 'rxjs';
import isEqual from 'lodash/fp/isEqual';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';

import { SetHeaderState } from '../store/app.actions';
import { DashboardService } from './services/dashboard.service';
import { GetDashboardData, SetPanels, SaveDashboard, ResetState } from './store/dashboard.actions';
import { DashboardState, DashboardStateModel } from './store/dashboard.state';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { WidgetDataDependenciesAggregatedModel } from './models/widget-data-dependencies-aggregated.model';
import { WidgetTypeEnum } from './enums/widget-type.enum';
import { UserState, UserStateModel } from 'src/app/store/user.state';
import { WidgetOptionModel } from './models/widget-option.model';
import { widgetTypeToConfigurationMapper } from './constants/widget-type-to-configuration-mapper';
import lodashMap from 'lodash/fp/map';
import { WidgetToggleModel } from './models/widget-toggle.model';
import { User } from '@shared/models/user.model';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { DashboardWidgetsComponent } from './dashboard-widgets/dashboard-widgets.component';
import type { WidgetsDataModel } from './models/widgets-data.model';
import type { DashboardLayoutComponent } from '@syncfusion/ej2-angular-layouts';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.components.html',
  styleUrls: ['dashboard.components.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent extends DestroyableDirective implements OnInit, OnDestroy {
  @ViewChild(DashboardWidgetsComponent, { static: false }) dashboardWidgetsComponent: DashboardWidgetsComponent;

  @Select(DashboardState.dashboardPanels) public readonly panels$: Observable<DashboardStateModel['panels']>;
  @Select(DashboardState.selectedWidgets) public readonly selectedWidgets$: Observable<WidgetTypeEnum[]>;
  @Select(DashboardState.widgets) public readonly widgets$: Observable<DashboardStateModel['widgets']>;

  @Select(DashboardState.isDashboardLoading) public readonly isLoading$: Observable<
    DashboardStateModel['isDashboardLoading']
  >;

  @Select(UserState.lastSelectedOrganizationId) private readonly organizationId$: Observable<
    UserStateModel['lastSelectedOrganizationId']
  >;

  @Select(UserState.lastSelectedAgencyId) private readonly agencyId$: Observable<
    UserStateModel['lastSelectedAgencyId']
  >;

  @Select(UserState.user) private readonly user$: Observable<User>;

  public widgetsData$: Observable<WidgetsDataModel>;
  public isOrganization$: Observable<boolean>;

  public readonly filtersGroup: FormGroup = this.getFiltersGroup();

  constructor(
    private readonly store: Store,
    private readonly dashboardService: DashboardService,
    private readonly formBuilder: FormBuilder,
    private readonly breakpointObserver: BreakpointObserver,
  ) {
    super();
    this.store.dispatch(new SetHeaderState({ title: 'Dashboard', iconName: 'home' }));
  }

  public ngOnInit(): void {
    this.setWidgetsData();
    this.initOrganizationChangeListener();
    this.isUserOrganization();
  }

  private isUserOrganization(): void {
    this.isOrganization$ = combineLatest([this.user$, this.organizationId$, this.agencyId$]).pipe(
      map(([user, organizationId, agencyId]: [User, number | null, number | null]) => {
        return !organizationId && !agencyId ? user?.businessUnitType !== BusinessUnitType.Agency : !!organizationId;
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
    const widgetConfiguration = widgetTypeToConfigurationMapper[widget.title];

    if (!widgetConfiguration) return;

    const newPanel = { ...widgetConfiguration, id: widget.title, row: 0, col: 0 };
    const updatePanelsList = [...this.dashboardSFComponentSerialized, newPanel];

    this.saveDashboard(updatePanelsList);
  }

  private removeWidget(widget: WidgetOptionModel): void {
    const updatePanelsList = this.dashboardSFComponentSerialized.filter(
      (panel: PanelModel) => panel.id !== widget.title
    );

    this.saveDashboard(updatePanelsList);
  }

  private saveDashboard(panelsList: PanelModel[]): void {
    this.store.dispatch(new SaveDashboard(panelsList));
  }

  public moveDashboardPanel(): void {
    this.saveDashboard(this.dashboardSFComponentSerialized);
  }

  private getFiltersGroup(): FormGroup {
    return this.formBuilder.group({ region: [null], location: [null], department: [null], skill: [null] });
  }

  private initOrganizationChangeListener(): void {
    this.organizationId$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.resetDashboardState();
      this.store.dispatch(new GetDashboardData());
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

  private getIsDashboardMobileView(): Observable<boolean> {
    return this.breakpointObserver
      .observe([`(${this.dashboardSFComponent.mediaQuery})`])
      .pipe(map((breakpointState: BreakpointState) => breakpointState.matches));
  }

  private initViewChangesListener() {
    combineLatest([this.getPanels$(), this.getIsDashboardMobileView()])
      .pipe(
        distinctUntilChanged((previous, current) => isEqual(previous, current)),
        takeUntil(this.destroy$)
      )
      .subscribe(([panels, isMobile]: [PanelModel[], boolean]) => {
        const updatedPanels = isMobile ? this.getUpdatePanelsForMobileView(panels) : panels;

        this.store.dispatch(new SetPanels(updatedPanels))
      });
  }

  private getUpdatePanelsForMobileView(panels: PanelModel[]): PanelModel[] {
    return lodashMap(
      (panel: PanelModel) => ({ ...panel, sizeX: 1, sizeY: 1, maxSizeY: 1, maxSizeX: 1, minSizeY: 1, minSizeX: 1 }),
      panels
    );
  }
}
