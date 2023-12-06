import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import { catchError, Observable, of, tap } from "rxjs";
import { ChartAccumulation } from '../../dashboard/models/chart-accumulation-widget.model';

import { IntegrationFilterDto } from "../../shared/models/integrations.model";
import { OrgintegrationsService } from '../organization-integrations/services/orgintegrations.service';
import { GetLast12MonthIntegrationRuns } from "./integrations.actions";

export interface IntegrationsStateModel {
  isDashboardLoading: boolean;
  filterData: IntegrationFilterDto | null;
  chartAccumulation: ChartAccumulation | null;
}
@State<IntegrationsStateModel>({
  name: 'integrations',
  defaults: {

    isDashboardLoading: false,
    filterData: null,
    chartAccumulation: null,
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

  @Action(GetLast12MonthIntegrationRuns)
  getDashboardData({ patchState }: StateContext<IntegrationsStateModel>, { payload }: GetLast12MonthIntegrationRuns): Observable<ChartAccumulation> {
    patchState({ isDashboardLoading: true });
    alert(1);
    return this.orgintegrationsService.getMonthlyIntegrationRuns(payload).pipe(
      tap((payload) => {
        patchState({ isDashboardLoading: false, chartAccumulation: payload });
        return payload;
      })
    );
  }
}
