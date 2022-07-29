import { Injectable } from '@angular/core';

import { Action, Selector, State, StateContext, Actions } from '@ngxs/store';
import { PanelModel } from '@syncfusion/ej2-angular-layouts';
import { Observable, tap } from 'rxjs';
import lodashMap from 'lodash/fp/map';

import { DashboardService } from '../services/dashboard.service';
import { GetDashboardData, SetPanels, SaveDashboard, ResetState, IsMobile, SetFilteredItems, SetDashboardFiltersState, SwitchMonthWeekTimeSelection } from './dashboard.actions';
import { WidgetOptionModel } from '../models/widget-option.model';
import { WidgetTypeEnum } from '../enums/widget-type.enum';
import { DashboardDataModel } from '../models/dashboard-data.model';
import { widgetTypeToConfigurationMapper } from '../constants/widget-type-to-configuration-mapper';
import { FilteredItem } from '@shared/models/filter.model';
import { DASHBOARD_FILTER_STATE, TIME_SELECTION_OF_CHART_LINE } from '@shared/constants';
import { DashboardFiltersModel } from '../models/dashboard-filters.model';
import { TimeSelectionEnum } from '../enums/time-selection.enum';

export interface DashboardStateModel {
  panels: PanelModel[];
  isDashboardLoading: boolean;
  widgets: WidgetOptionModel[];
  isMobile: boolean;
  filteredItems: FilteredItem[];
  dashboardFilterState: DashboardFiltersModel;
  positionTrendTimeSelection: TimeSelectionEnum;
}

@State<DashboardStateModel>({
  name: 'dashboard',
  defaults: {
    panels: [],
    isDashboardLoading: false,
    widgets: [],
    isMobile: false,
    filteredItems: JSON.parse(window.localStorage.getItem(DASHBOARD_FILTER_STATE) as string) || [],
    dashboardFilterState: {} as DashboardFiltersModel,
    positionTrendTimeSelection: JSON.parse(window.localStorage.getItem(TIME_SELECTION_OF_CHART_LINE) as string) || TimeSelectionEnum.Monthly,
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

  @Selector()
  static filteredItems(state: DashboardStateModel): DashboardStateModel['filteredItems'] {
    return state.filteredItems;
  }

  @Selector()
  static dashboardFiltersState(state: DashboardStateModel): DashboardStateModel['dashboardFilterState'] {
    return state.dashboardFilterState;
  }

  @Selector()
    static getTimeSelection(state: DashboardStateModel): DashboardStateModel['positionTrendTimeSelection'] {
      return state.positionTrendTimeSelection;
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

  @Action(SetFilteredItems)
  private setFilteredItems({patchState}: StateContext<DashboardStateModel>, { payload }: SetFilteredItems) {
    patchState({filteredItems: payload});
    window.localStorage.setItem(DASHBOARD_FILTER_STATE, JSON.stringify(payload));
    
  }

  @Action(SetDashboardFiltersState)
  private setDashboardFiltersState({patchState}: StateContext<DashboardStateModel>, { payload }: SetDashboardFiltersState) {
    patchState({ dashboardFilterState: payload })
  }

  @Action(SwitchMonthWeekTimeSelection)
  private switchMonthWeekTimeSelection({patchState}: StateContext<DashboardStateModel>, { payload }: SwitchMonthWeekTimeSelection) {
    patchState({positionTrendTimeSelection: payload})
    window.localStorage.setItem(TIME_SELECTION_OF_CHART_LINE, JSON.stringify(payload));
  }
}
