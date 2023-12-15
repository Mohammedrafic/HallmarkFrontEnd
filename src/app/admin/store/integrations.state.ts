import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import { catchError, Observable, of, tap } from "rxjs";
import { ChartAccumulation } from '../../dashboard/models/chart-accumulation-widget.model';

import { IntegrationFilterDto } from "../../shared/models/integrations.model";
import { OrgintegrationsService } from '../organization-integrations/services/orgintegrations.service';
import { GetLast12MonthIntegrationRuns, GetLast12MonthFailIntegrationRuns, GetNewInterfaceList,  GetRecentRunsList } from "./integrations.actions";
import { NewInterfaceListdata } from '@admin/organization-integrations/models/IntegrationMonthReportModel';
import { RecentRunsListModel } from 'src/app/admin/organization-integrations/models/RecentRunsListModel';


export interface IntegrationsStateModel extends IntegrationStateModel {
}

export interface IntegrationsFailureStateModel extends IntegrationStateModel {
}

interface IntegrationStateModel {
  isDashboardLoading: boolean;
  filterData: IntegrationFilterDto | null;
  chartAccumulation: ChartAccumulation | null;
  failureChartAccumulation: ChartAccumulation | null;
  Latestinterfacedata: NewInterfaceListdata | null;
  RecentRunsList: RecentRunsListModel[] | null;
}
@State<IntegrationsStateModel>({
  name: 'integrations',
  defaults: {

    isDashboardLoading: false,
    filterData: null,
    chartAccumulation: null,
    failureChartAccumulation: null,
    Latestinterfacedata: null,
     RecentRunsList: null,
  },
})
@Injectable()
export class IntegrationsState {

  public constructor(
    private readonly orgintegrationsService: OrgintegrationsService,
    private readonly store: Store,
  ) { }

  @Selector()
  static chartAccumulation(state: IntegrationsStateModel): ChartAccumulation | null { return state.chartAccumulation; }

  @Selector()
  static failureChartAccumulation(state: IntegrationsStateModel): ChartAccumulation | null { return state.failureChartAccumulation; }


  @Selector()
  static getRecentRunsList(state: IntegrationsStateModel): RecentRunsListModel[] | null {
    return state.RecentRunsList;
  }

  @Action(GetLast12MonthIntegrationRuns)
  getDashboardData({ patchState }: StateContext<IntegrationsStateModel>, { payload }: GetLast12MonthIntegrationRuns): Observable<ChartAccumulation> {
    patchState({ isDashboardLoading: true });
    
    return this.orgintegrationsService.getMonthlyIntegrationRuns(payload).pipe(
      tap((payload) => {
        patchState({ isDashboardLoading: false, chartAccumulation: payload });
        return payload;
      })
    );
  }

  @Action(GetLast12MonthFailIntegrationRuns)
  getInetegrationFailsData({ patchState }: StateContext<IntegrationsFailureStateModel>, { payload }: GetLast12MonthFailIntegrationRuns): Observable<ChartAccumulation> {
    patchState({ isDashboardLoading: true });
    return this.orgintegrationsService.getMonthlyIntegrationRunFailure(payload).pipe(
      tap((payload) => {
        patchState({ isDashboardLoading: false, failureChartAccumulation: payload });
        return payload;
      })
    );
  }
  
  @Selector()
  static NewInterfaceListState(state: IntegrationsStateModel): NewInterfaceListdata | null { return state.Latestinterfacedata; }

  @Action(GetNewInterfaceList)
  getDashboardNewInterfaceList({ patchState }: StateContext<IntegrationsStateModel>, { payload }: GetNewInterfaceList): Observable<NewInterfaceListdata> {
    patchState({ isDashboardLoading: true });    
    return this.orgintegrationsService.getLatestInterfaceList(payload).pipe(
      tap((payload) => {
        patchState({ isDashboardLoading: false, Latestinterfacedata: payload });
        return payload;
      })
    );
  }

  @Action(GetRecentRunsList)
  private getRecentRunsList({ patchState }: StateContext<IntegrationsStateModel>, { payload }: GetRecentRunsList): Observable<RecentRunsListModel[]> {
    return this.orgintegrationsService.getRecentRunsList(payload).pipe(
      tap((payload: RecentRunsListModel[]) => {
        patchState({ RecentRunsList: payload });
      })
    );
  }

}
