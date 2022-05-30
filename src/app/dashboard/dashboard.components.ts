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

  constructor(private store: Store, private actions$: Actions) {}

  ngOnInit(): void {
    this.getDashboardPanels();
    this.refreshDashboard();
  }

  ngOnDestroy(): void {
    this.unsubsribe$.next(true);
    this.unsubsribe$.complete();
  }

  private getDashboardPanels() {
    this.store.dispatch(new GetDashboardPanels());
    this.panels$.pipe(take(1)).subscribe((panels) => (this.panels = panels));
  }

  private refreshDashboard(): void {
    this.refreshGrid();
    this.actions$.pipe(ofActionDispatched(ToggleSidebarState), takeUntil(this.unsubsribe$)).subscribe(() => {
      this.refreshGrid();
    });
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
