import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { PanelModel } from '@syncfusion/ej2-angular-layouts';
import { Observable, tap } from 'rxjs';
import { DashboardService } from '../services/dashboard.service';
import { AddDashboardPanel, GetDashboardPanels } from './dashboard.actions';

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
        return payload;
      })
    );
  }

  @Action(AddDashboardPanel)
  addDashboardPanel({ getState, patchState }: StateContext<DashboardStateModel>, { payload }: AddDashboardPanel) {
    patchState({ isDashboardLoading: true });
    return this.dashboardService.addDashboardPanel(payload).pipe(
      tap((panel) => {
        const state = getState();
        patchState({ panels: [...state.panels, panel], isDashboardLoading: false });
      })
    );
  }
}
