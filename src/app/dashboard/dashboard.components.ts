import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';

import { Actions, ofActionDispatched, Select, Store } from '@ngxs/store';
import { DashboardLayoutComponent, PanelModel } from '@syncfusion/ej2-angular-layouts';
import { Observable, Subject, take, takeUntil } from 'rxjs';

import { ToggleSidebarState } from '../store/app.actions';
import { AddDashboardPanel, DashboardPanelIsMoved, GetDashboardPanels } from './store/dashboard.actions';
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
  panels: PanelModel[] = [];
  cellSpacing = [15, 15];
  columns = 12;

  widgets: Map<string, any> = new Map([
    [
      'chart_line_1',
      {
        name: 'Pending Orders',
        progress: 1,
        data: 4.53,
        data2: 0.45,
        chartData: [
          { x: 1, y: 30 },
          { x: 2, y: 28 },
          { x: 3, y: 35 },
          { x: 4, y: 28 },
          { x: 5, y: 33 },
          { x: 6, y: 32 },
          { x: 7, y: 30 },
        ],
      },
    ],
    [
      'chart_line_2',
      {
        name: 'Bill Rate Fluctoation',
        progress: -1,
        data: 4.53,
        data2: 0.45,
        chartData: [
          { x: 1, y: 30 },
          { x: 2, y: 28 },
          { x: 3, y: 35 },
          { x: 4, y: 28 },
          { x: 5, y: 40 },
          { x: 6, y: 32 },
          { x: 7, y: 35 },
        ],
      },
    ],
    [
      'chart_line_3',
      {
        name: 'Orders Starting in the Future',
        progress: 1,
        data: 14.53,
        data2: 129,
        chartData: [
          { x: 1, y: 38 },
          { x: 2, y: 40 },
          { x: 3, y: 39 },
          { x: 4, y: 42 },
          { x: 5, y: 45 },
          { x: 6, y: 43 },
          { x: 7, y: 48 },
        ],
      },
    ],
  ]);

  constructor(private store: Store, private actions$: Actions) {}

  ngOnInit(): void {
    this.getDashboardPanels();
    this.refreshDashboard();
  }

  ngOnDestroy(): void {
    this.unsubsribe$.next(true);
    this.unsubsribe$.complete();
  }

  private getDashboardPanels(): void {
    this.store.dispatch(new GetDashboardPanels());
    this.panels$.pipe(take(1)).subscribe((panels) => (this.panels = panels));
  }

  private refreshDashboard(): void {
    this.refreshGrid();
    this.actions$.pipe(ofActionDispatched(ToggleSidebarState), takeUntil(this.unsubsribe$)).subscribe((data) => this.refreshGrid());
  }

  private refreshGrid(): void {
    setTimeout(() => this.dashboard.refresh(), 500);
  }

  private dashboardPanels(): PanelModel[] {
    return this.dashboard.serialize();
  }

  moveDashboardPanel(): void {
    const panels = this.dashboardPanels().map((panel, idx) => {
      return {
        ...panel,
        content: `<div class='content'>${idx}</div>`,
      };
    });
    this.store.dispatch(new DashboardPanelIsMoved(panels));
  }

  addPanel(): void {
    const allPanels = this.dashboardPanels().length;
    const panel: PanelModel = {
      id: 'layout_' + allPanels,
      sizeX: 3,
      sizeY: 3,
      row: 0,
      col: 0,
      content: `<div class="content">${allPanels + 1}</div>`,
    };
    this.dashboard.addPanel(panel);
    this.store.dispatch(new AddDashboardPanel(this.dashboardPanels()));
  }
}
