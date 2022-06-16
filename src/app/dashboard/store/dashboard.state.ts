import { Injectable } from '@angular/core';

import { Action, Selector, State, StateContext, Actions } from '@ngxs/store';
import { PanelModel } from '@syncfusion/ej2-angular-layouts';
import { Observable, tap } from 'rxjs';

import { DashboardService } from '../services/dashboard.service';
import { GetDashboardData, SetPanels, SaveDashboard, ResetState } from './dashboard.actions';
import { WidgetOptionModel } from '../models/widget-option.model';
import { WidgetTypeEnum } from '../enums/widget-type.enum';
import lodashMap from 'lodash/fp/map';
import { DashboardDataModel } from '../models/dashboard-data.model';

export interface DashboardStateModel {
  panels: PanelModel[];
  isDashboardLoading: boolean;
  widgets: WidgetOptionModel[];
}

@State<DashboardStateModel>({
  name: 'dashboard',
  defaults: {
    panels: [],
    isDashboardLoading: false,
    widgets: [],
  },
})
@Injectable()
export class DashboardState {
  @Selector()
  static dashboardPanels(state: DashboardStateModel): PanelModel[] {
    return state.panels;
  }

  @Selector([DashboardState.dashboardPanels])
  static selectedWidgets(_: DashboardState, panels: DashboardStateModel['panels']): WidgetTypeEnum[] {
    return lodashMap((panel: PanelModel) => panel.id as WidgetTypeEnum, panels);
  }

  @Selector()
  static isDashboardLoading(state: DashboardStateModel): DashboardStateModel['isDashboardLoading'] {
    return state.isDashboardLoading;
  }

  @Selector()
  static widgets(state: DashboardStateModel): DashboardStateModel['widgets'] {
    return state.widgets;
  }

  public constructor(private readonly actions: Actions, private dashboardService: DashboardService) {}

  @Action(GetDashboardData)
  getDashboardData({ patchState }: StateContext<DashboardStateModel>): Observable<DashboardDataModel> {
    patchState({ isDashboardLoading: true });

    return this.dashboardService.getDashboardsData().pipe(
      tap(({ panels, widgets }: DashboardDataModel) => {
        patchState({ panels, widgets, isDashboardLoading: false });
      }),
    );
  }

  @Action(SaveDashboard)
  private saveDashboard(
    { patchState }: StateContext<DashboardStateModel>,
    { payload }: SaveDashboard
  ): Observable<void> {
    patchState({ panels: payload });
    return this.dashboardService.saveDashboard(payload);
  }

  @Action(SetPanels)
  private setPanels({ patchState }: StateContext<DashboardStateModel>, { payload }: SetPanels): void {
    patchState({ panels: payload });
  }

  @Action(ResetState)
  private resetState({ patchState }: StateContext<DashboardStateModel>): void {
    patchState({ panels: [], widgets: [], isDashboardLoading: false });
  }
}
