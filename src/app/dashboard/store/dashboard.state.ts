import { Injectable } from '@angular/core';

import { Action, Selector, State, StateContext } from '@ngxs/store';
import { PanelModel } from '@syncfusion/ej2-angular-layouts';
import { Observable, tap } from 'rxjs';

import { DashboardService } from '../services/dashboard.service';
import { AddDashboardPanel, DashboardPanelIsMoved, DeleteDashboardPanels, GetDashboardPanels, SaveDashboard } from './dashboard.actions';

export interface DashboardStateModel {
  panels: PanelModel[];
  isDashboardLoading: boolean;
}

@State<DashboardStateModel>({
  name: 'dashboard',
  defaults: {
    panels: [],
    isDashboardLoading: false,
  },
})
@Injectable()
export class DashboardState {
  @Selector()
  static dashboardPanels(state: DashboardStateModel): PanelModel[] {
    return state.panels;
  }
  @Selector()
  static isDashboardLoading(state: DashboardStateModel): boolean {
    return state.isDashboardLoading;
  }

  constructor(private dashboardService: DashboardService) {}

  @Action(GetDashboardPanels)
  getDashboardPanels({ patchState }: StateContext<DashboardStateModel>): Observable<PanelModel[]> {
    patchState({ isDashboardLoading: true });
    return this.dashboardService.getDashboardsPanels().pipe(
      tap((payload) => {
        patchState({ panels: payload, isDashboardLoading: false });
      })
    );
  }

  @Action(AddDashboardPanel)
  addDashboardPanel({ patchState, dispatch }: StateContext<DashboardStateModel>, { payload }: AddDashboardPanel) {
    patchState({ isDashboardLoading: true });
    return this.dashboardService.addDashboardPanel(payload).pipe(
      tap(() => {
        patchState({ panels: payload, isDashboardLoading: false });
        dispatch(new SaveDashboard());
      })
    );
  }

  @Action(DashboardPanelIsMoved)
  dashboardPanelIsMoved({ patchState, dispatch }: StateContext<DashboardStateModel>, { payload }: DashboardPanelIsMoved) {
    patchState({ panels: payload });
    dispatch(new SaveDashboard());
  }

  @Action(SaveDashboard)
  saveDashboard({ getState, patchState }: StateContext<DashboardStateModel>) {
    patchState({ isDashboardLoading: true });
    const state = getState();
    return this.dashboardService.saveDashboard(state.panels).pipe(
      tap(() => {
        patchState({ isDashboardLoading: false });
      })
    );
  }

  @Action(DeleteDashboardPanels)
  deleteDashboardPanels({patchState}:StateContext<DashboardStateModel>) {
    patchState({ panels: [] });
  }

}
