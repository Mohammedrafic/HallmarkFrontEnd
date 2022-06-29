import { Injectable } from '@angular/core';

import { Action, Selector, State, StateContext, Actions } from '@ngxs/store';
import { PanelModel } from '@syncfusion/ej2-angular-layouts';
import { Observable, tap } from 'rxjs';

import { DashboardService } from '../services/dashboard.service';
import { GetDashboardData, SetPanels, SaveDashboard, ResetState, IsMobile } from './dashboard.actions';
import { WidgetOptionModel } from '../models/widget-option.model';
import { WidgetTypeEnum } from '../enums/widget-type.enum';
import lodashMap from 'lodash/fp/map';
import { DashboardDataModel } from '../models/dashboard-data.model';
import { widgetTypeToConfigurationMapper } from '../constants/widget-type-to-configuration-mapper';

export interface DashboardStateModel {
  panels: PanelModel[];
  isDashboardLoading: boolean;
  widgets: WidgetOptionModel[];
  isMobile: boolean;
}

@State<DashboardStateModel>({
  name: 'dashboard',
  defaults: {
    panels: [],
    isDashboardLoading: false,
    widgets: [],
    isMobile: false,
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

  @Selector()
  static isMobile(state: DashboardStateModel): DashboardStateModel['isMobile'] {
    return state.isMobile;
  }

  public constructor(private readonly actions: Actions, private dashboardService: DashboardService) {}

  @Action(GetDashboardData)
  getDashboardData({ patchState }: StateContext<DashboardStateModel>): Observable<DashboardDataModel> {
    patchState({ isDashboardLoading: true });

    return this.dashboardService.getDashboardsData().pipe(
      tap(({ panels, widgets }: DashboardDataModel) => {
        patchState({ panels, widgets, isDashboardLoading: false });
      })
    );
  }

  @Action(SaveDashboard)
  private saveDashboard(
    { patchState, getState }: StateContext<DashboardStateModel>,
    { payload }: SaveDashboard
  ): Observable<void> {
    const panels: PanelModel[] = getState().isMobile
      ? payload.map((panel: PanelModel) => ({
          ...panel,
          ...widgetTypeToConfigurationMapper[panel.id as WidgetTypeEnum],
        }))
      : payload;
      patchState({ panels });

    return this.dashboardService.saveDashboard(panels);
  }

  @Action(SetPanels)
  private setPanels({ patchState }: StateContext<DashboardStateModel>, { payload }: SetPanels): void {
    patchState({ panels: payload });
  }

  @Action(ResetState)
  private resetState({ patchState }: StateContext<DashboardStateModel>): void {
    patchState({ panels: [], widgets: [], isDashboardLoading: false });
  }

  @Action(IsMobile)
  private isMobile({ patchState }: StateContext<DashboardStateModel>, { payload }: IsMobile): void {
    patchState({ isMobile: payload });
  }
}
