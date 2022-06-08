import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';

import { Actions, ofActionDispatched, Select, Store } from '@ngxs/store';
import { DashboardLayoutComponent, PanelModel } from '@syncfusion/ej2-angular-layouts';
import { Observable, takeUntil, startWith, distinctUntilChanged, switchMap, combineLatest, skip } from 'rxjs';
import isEqual from 'lodash/fp/isEqual';

import { ToggleSidebarState } from '../store/app.actions';
import { DashboardService } from './services/dashboard.service';
import {
  AddDashboardPanel,
  DashboardPanelIsMoved,
  DeleteDashboardPanels,
  GetDashboardPanels,
} from './store/dashboard.actions';
import { DashboardState } from './store/dashboard.state';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { WidgetDataDependenciesAggregatedModel } from './models/widget-data-dependencies-aggregated.model';
import { WidgetTypeEnum } from './enums/widget-type.enum';
import { UserState } from 'src/app/store/user.state';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.components.html',
  styleUrls: ['dashboard.components.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DashboardComponent extends DestroyableDirective implements OnInit, OnDestroy {
  @ViewChild('dashboardLayout', { static: false }) dashboard: DashboardLayoutComponent;

  @Select(DashboardState.dashboardPanels) panels$: Observable<PanelModel[]>;
  @Select(DashboardState.isDashboardLoading) isLoading$: Observable<boolean>;
  @Select(UserState.lastSelectedOrganizationId)
  organizationId$: Observable<number>;

  public widgetsData$: Observable<Record<WidgetTypeEnum, unknown>>;
  public readonly cellSpacing = [24, 24];
  public readonly columns = 12;
  public readonly filtersGroup: FormGroup = this.getFiltersGroup();
  public readonly widgetTypeEnum: typeof WidgetTypeEnum = WidgetTypeEnum;

  constructor(
    private store: Store,
    private actions$: Actions,
    private dashboardService: DashboardService,
    private readonly formBuilder: FormBuilder
  ) {
    super();
  }

  public ngOnInit(): void {
    this.setWidgetsData();
    this.getDashboardPanels();
    this.refreshDashboard();
    this.organizationId$.pipe(takeUntil(this.destroy$), skip(1)).subscribe(() => {
      this.deleteDashboardPanels();
      this.getDashboardPanels();
    });
  }

  public trackByHandler(_: number, panel: PanelModel): string {
    return panel.id ?? '';
  }

  private getDashboardPanels(): void {
    this.store.dispatch(new GetDashboardPanels());
  }

  private refreshDashboard(): void {
    this.refreshGrid();
    this.actions$
      .pipe(ofActionDispatched(ToggleSidebarState), takeUntil(this.destroy$))
      .subscribe(() => this.refreshGrid());
  }

  private refreshGrid(): void {
    setTimeout(() => this.dashboard.refresh(), 500);
  }

  private dashboardPanels(): PanelModel[] {
    return this.dashboard.serialize();
  }

  private deleteDashboardPanels(): void {
    this.store.dispatch(new DeleteDashboardPanels());
  }

  moveDashboardPanel(): void {
    this.store.dispatch(new DashboardPanelIsMoved(this.dashboardPanels()));
  }

  addPanel(): void {
    const allPanels = this.dashboardPanels().length;
    const panel: PanelModel = {
      id: 'layout_' + allPanels,
      sizeX: 3,
      sizeY: 3,
      row: 0,
      col: 0,
    };
    this.dashboard.addPanel(panel);
    this.store.dispatch(new AddDashboardPanel(this.dashboardPanels()));
  }

  private getFiltersGroup(): FormGroup {
    return this.formBuilder.group({ region: [null], location: [null], department: [null], skill: [null] });
  }

  private setWidgetsData(): void {
    const formChanges$ = this.filtersGroup.valueChanges.pipe(startWith(this.filtersGroup.value));

    this.widgetsData$ = combineLatest([this.panels$, formChanges$]).pipe(
      distinctUntilChanged(
        (previous: WidgetDataDependenciesAggregatedModel, current: WidgetDataDependenciesAggregatedModel) =>
          isEqual(previous, current)
      ),
      switchMap((data: WidgetDataDependenciesAggregatedModel) => this.dashboardService.getWidgetsAggregatedData(data))
    );
  }
}
