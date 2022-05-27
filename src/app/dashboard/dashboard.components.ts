import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';

import { Actions, ofActionDispatched, Select, Store } from '@ngxs/store';
import { DashboardLayoutComponent, PanelModel } from '@syncfusion/ej2-angular-layouts';
import { Observable, Subject, takeUntil } from 'rxjs';

import { ToggleSidebarState } from '../store/app.actions';
import { AddDashboardPanel, DashboardPanelIsMoved, GetDashboardPanels, SaveDashboard } from './store/dashboard.actions';
import { DashboardState } from './store/dashboard.state';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.components.html',
  styleUrls: ['dashboard.components.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DashboardComponent implements OnInit, OnDestroy {
  @ViewChild('dashboardLayout', { static: true }) dashboard: DashboardLayoutComponent;

  @Select(DashboardState.dashboardPanels) panels$: Observable<PanelModel[]>;
  @Select(DashboardState.isDashboardLoading) isLoading$: Observable<boolean>;

  private unsubsribe$ = new Subject();

  cellSpacing = [10, 10];
  columns = 5;

  constructor(private store: Store, private actions$: Actions) {}

  ngOnInit(): void {
    this.store.dispatch(new GetDashboardPanels());
    this.refreshDashboard();
  }

  ngOnDestroy(): void {
    this.saveDashboard();
    this.unsubsribe$.next(true);
    this.unsubsribe$.complete();
  }

  private refreshDashboard() {
    this.refreshGrid();
    this.actions$.pipe(ofActionDispatched(ToggleSidebarState), takeUntil(this.unsubsribe$)).subscribe(() => {
      this.refreshGrid();
    });
  }

  private refreshGrid() {
    setTimeout(() => this.dashboard.refresh(), 500);
  }

  private saveDashboard(): void {
    this.store.dispatch(new SaveDashboard());
  }

  private getDashboardPanels(): PanelModel[] {
    return this.dashboard.panels.map((panel: any) => panel.properties);
  }

  moveDashboardPanel(): void {
    const panels = this.getDashboardPanels();
    this.store.dispatch(new DashboardPanelIsMoved(panels));
  }

  addPanel(): void {
    const allPanels = this.dashboard.panels.length;
    const panel: PanelModel = {
      id: 'layout_' + allPanels,
      sizeX: 1,
      sizeY: 1,
      row: 0,
      col: 0,
      content: `<div class="content">${allPanels + 1}</div>`,
    };
    this.dashboard.addPanel(panel)
    const panels = this.getDashboardPanels();
    this.store.dispatch(new AddDashboardPanel(panels));
  }
}
