import { Injectable } from '@angular/core';

import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import { PanelModel } from '@syncfusion/ej2-angular-layouts';
import { Observable, tap } from 'rxjs';
import lodashMap from 'lodash/fp/map';

import { DashboardService } from '../services/dashboard.service';
import {
  GetDashboardData,
  SetPanels,
  SaveDashboard,
  ResetState,
  SetFilteredItems,
  SwitchMonthWeekTimeSelection,
  GetOrganizationSkills,
  GetAllSkills,
  ToggleQuickOrderDialog,
  GetAllCommitmentByPage,
  GetSkilldata,
  FilterNursingWidget,
  SetDashboardWidgetFilter,
} from './dashboard.actions';
import { WidgetOptionModel } from '../models/widget-option.model';
import { WidgetTypeEnum } from '../enums/widget-type.enum';
import { DashboardDataModel } from '../models/dashboard-data.model';
import { widgetTypeToConfigurationMapper } from '../constants/widget-type-to-configuration-mapper';
import { FilteredItem } from '@shared/models/filter.model';
import { DASHBOARD_FILTER_STATE, TIME_SELECTION_OF_CHART_LINE } from '@shared/constants';
import { TimeSelectionEnum } from '../enums/time-selection.enum';
import { AssignedSkillsByOrganization } from '@shared/models/skill.model';
import { AllOrganizationsSkill } from '../models/all-organization-skill.model';
import { GetNursingWidgetData, GetWorkCommitment } from '../models/rn-utilization.model';
import { DashboartFilterDto } from '../models/dashboard-filter-dto.model';
import { AppState } from 'src/app/store/app.state';

export interface DashboardStateModel {
  panels: PanelModel[];
  isDashboardLoading: boolean;
  widgets: WidgetOptionModel[];
  filteredItems: FilteredItem[];
  filterData: DashboartFilterDto | null;
  positionTrendTimeSelection: TimeSelectionEnum;
  skills: AllOrganizationsSkill[];
  organizationSkills: AssignedSkillsByOrganization[];
  toggleQuickOrderDialog: boolean
  commitmentsPage: GetWorkCommitment[];
  isCommitmentLoading: boolean;
  nursingSkill: GetWorkCommitment[];
  nursingCount: GetNursingWidgetData | null;
}

@State<DashboardStateModel>({
  name: 'dashboard',
  defaults: {
    panels: [],
    isDashboardLoading: false,
    widgets: [],
    filteredItems: JSON.parse(window.localStorage.getItem(DASHBOARD_FILTER_STATE) as string) || [],
    filterData: null,
    positionTrendTimeSelection: JSON.parse(window.localStorage.getItem(TIME_SELECTION_OF_CHART_LINE) as string)
      || TimeSelectionEnum.Monthly,
    organizationSkills: [],
    skills: [],
    toggleQuickOrderDialog: false,
    commitmentsPage: [],
    isCommitmentLoading: false,
    nursingSkill: [],
    nursingCount: null,
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
  static filteredItems(state: DashboardStateModel): DashboardStateModel['filteredItems'] {
    return state.filteredItems;
  }

  @Selector()
  static getTimeSelection(state: DashboardStateModel): DashboardStateModel['positionTrendTimeSelection'] {
    return state.positionTrendTimeSelection;
  }

  @Selector()
  static getAllOrganizationSkills(state: DashboardStateModel): DashboardStateModel['skills'] {
    return state.skills;
  }

  @Selector()
  static getOrganizationSkills(state: DashboardStateModel): DashboardStateModel['organizationSkills'] {
    return state.organizationSkills;
  }

  @Selector()
  static toggleQuickOrderDialog(state: DashboardStateModel): DashboardStateModel['toggleQuickOrderDialog'] {
    return state.toggleQuickOrderDialog;
  }

  @Selector()
  static commitmentsPage(state: DashboardStateModel): DashboardStateModel['commitmentsPage'] {
    return state.commitmentsPage;
  }

  @Selector()
  static nursingSkill(state: DashboardStateModel): DashboardStateModel['nursingSkill'] {
    return state.nursingSkill;
  }

  @Selector()
  static nursingCount(state: DashboardStateModel): DashboardStateModel['nursingCount'] {
    return state.nursingCount;
  }

  @Selector()
  static filterData(state: DashboardStateModel): DashboardStateModel['filterData'] {
    return state.filterData;
  }

  public constructor(
    private readonly dashboardService: DashboardService,
    private readonly store: Store,
  ) { }

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
    { patchState }: StateContext<DashboardStateModel>,
    { payload }: SaveDashboard
  ): Observable<void> {
    const isMobile = this.store.selectSnapshot(AppState.isMobileScreen);
    let panels: PanelModel[];

    if (isMobile) {
      panels = payload.map((panel: PanelModel) => ({
        ...panel,
        ...widgetTypeToConfigurationMapper[panel.id as WidgetTypeEnum],
      }));
    } else {
      panels = payload;
    }

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

  @Action(SetFilteredItems)
  private setFilteredItems({ patchState }: StateContext<DashboardStateModel>, { payload }: SetFilteredItems) {
    patchState({ filteredItems: payload });
    window.localStorage.setItem(DASHBOARD_FILTER_STATE, JSON.stringify(payload));
  }

  @Action(SwitchMonthWeekTimeSelection)
  private switchMonthWeekTimeSelection(
    { patchState }: StateContext<DashboardStateModel>,
    { payload }: SwitchMonthWeekTimeSelection
  ) {
    patchState({ positionTrendTimeSelection: payload });
    window.localStorage.setItem(TIME_SELECTION_OF_CHART_LINE, JSON.stringify(payload));
  }

  @Action(GetAllSkills)
  private getAllSkills({ patchState }: StateContext<DashboardStateModel>) {
    return this.dashboardService.getAllSkills().pipe(
      tap((payload: AllOrganizationsSkill[]) => {
        patchState({ skills: payload });
      })
    );
  }

  @Action(GetOrganizationSkills)
  private GetOrganizationSkills(
    { patchState }: StateContext<DashboardStateModel>,
    { businessUnitId }: GetOrganizationSkills
  ): Observable<AssignedSkillsByOrganization[]> {
    return this.dashboardService.getOrganizationSkills(businessUnitId).pipe(
      tap((payload: AssignedSkillsByOrganization[]) => {
        patchState({ organizationSkills: payload });
      })
    );
  }

  @Action(ToggleQuickOrderDialog)
  private ToggleQuickOrderDialog(
    { patchState }: StateContext<DashboardStateModel>,
    { isOpen }: ToggleQuickOrderDialog): void {
    patchState({ toggleQuickOrderDialog: isOpen });
  }

  @Action(GetAllCommitmentByPage)
  GetAllCommitmentByPage(
    { patchState }: StateContext<DashboardStateModel>,
    { payload }: GetAllCommitmentByPage
  ): Observable<GetWorkCommitment[]> {
    //patchState({ isCommitmentLoading: true });

    return this.dashboardService.getAllMasterCommitments(payload).pipe(
      tap((payload:GetWorkCommitment[]) => {
        patchState({commitmentsPage: payload});
      })
    );
  }

  @Action(GetSkilldata)
  GetSkilldata(
    { patchState }: StateContext<DashboardStateModel>,
    { payload }: GetSkilldata
  ): Observable<GetWorkCommitment[]> {
    return this.dashboardService.getSkills(payload).pipe(
      tap((payload:GetWorkCommitment[]) => {
        patchState({nursingSkill: payload});
      })
    );
  }

  @Action(FilterNursingWidget)
  FilterNursingWidget(
    { patchState } : StateContext<DashboardStateModel>,
    { payload } : FilterNursingWidget
  ) : Observable<GetNursingWidgetData> {
    return this.dashboardService.filterNursingWidget(payload).pipe(
      tap((payload : GetNursingWidgetData) => {
        patchState({nursingCount : payload});
      }),
    )
  }

  @Action(SetDashboardWidgetFilter)
  SetDashboardWidgetFilter(
    { patchState }: StateContext<DashboardStateModel>,
    { payload  }: SetDashboardWidgetFilter
  ): DashboartFilterDto {
      patchState({filterData: payload});
      return payload;
  }

}
