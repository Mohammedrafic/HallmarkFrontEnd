import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import lodashMap from 'lodash/fp/map';
import lodashMapPlain from 'lodash/map';

import { PanelModel } from '@syncfusion/ej2-angular-layouts';
import { Observable, of, forkJoin, catchError } from 'rxjs';
import { map } from 'rxjs/operators';

import { ChartAccumulation } from '../models/chart-accumulation-widget.model';
import { WidgetDataDependenciesAggregatedModel } from '../models/widget-data-dependencies-aggregated.model';
import { DashboardFiltersModel } from '../models/dashboard-filters.model';
import { WidgetTypeEnum } from '../enums/widget-type.enum';
import { CandidatesByStatesResponseModel } from '../models/candidates-by-states-response.model';
import { CandidatesByStateWidgetAggregatedDataModel } from '../models/candidates-by-state-widget-aggregated-data.model';
import { DashboardStateDto } from '../models/dashboard-state-dto.model';
import { USAMapCandidatesDataLayerSettings } from '../constants/USA-map-candidates-data-layer-settings';
import reduce from 'lodash/reduce';
import { CandidateTypeInfoModel } from '../models/candidate-type-info.model';
import { legendPalette } from '../constants/legend-palette';
import flow from 'lodash/fp/flow';
import values from 'lodash/fp/values';
import max from 'lodash/fp/max';
import { WidgetOptionModel, AvailableWidgetsResponseModel } from '../models/widget-option.model';
import find from 'lodash/fp/find';
import lodashFilter from 'lodash/fp/filter';
import identity from 'lodash/fp/identity';
import { DashboardDataModel } from '../models/dashboard-data.model';

@Injectable()
export class DashboardService {
  private readonly baseUrl = '/api/Dashboard';
  private readonly widgetTypeToDataMapper: Record<
    WidgetTypeEnum,
    (filters: DashboardFiltersModel) => Observable<unknown>
  > = {
    [WidgetTypeEnum.CANDIDATES]: (filters: DashboardFiltersModel) => this.getCandidatesWidgetData(filters),
    [WidgetTypeEnum.APPLICANTS_BY_REGION]: (filters: DashboardFiltersModel) =>
      this.getApplicantsByRegionWidgetData(filters),
  };

  constructor(private httpClient: HttpClient) {}

  public getDashboardsData(): Observable<DashboardDataModel> {
    return forkJoin({ panels: this.getDashboardState(), widgets: this.getWidgetList() }).pipe(
      map(({ panels, widgets }: DashboardDataModel) => {
        const availablePanels = flow(
          lodashMap((widget: WidgetOptionModel) => find((panel: PanelModel) => panel.id === widget.title, panels)),
          lodashFilter(identity)
        )(widgets) as PanelModel[];

        return { panels: availablePanels, widgets };
      }),
      catchError(() => of({ panels: [], widgets: [] }))
    );
  }

  public saveDashboard(dashboard: PanelModel[]): Observable<void> {
    const dasboardState = JSON.stringify(dashboard);
    return this.httpClient.post<void>(`${this.baseUrl}/SaveState`, { dasboardState });
  }

  public getWidgetsAggregatedData([panels, filters]: WidgetDataDependenciesAggregatedModel): Observable<
    Record<WidgetTypeEnum, unknown>
  > {
    const data: Record<WidgetTypeEnum, Observable<unknown>> = reduce(
      panels,
      (accumulator: Record<WidgetTypeEnum, Observable<unknown>>, panel: PanelModel) => ({
        ...accumulator,
        [panel.id as WidgetTypeEnum]: this.widgetTypeToDataMapper[panel.id as WidgetTypeEnum]?.(filters) ?? of(null),
      }),
      {} as Record<WidgetTypeEnum, Observable<unknown>>
    );

    return forkJoin(data);
  }

  private getWidgetList(): Observable<WidgetOptionModel[]> {
    return this.httpClient
      .get<AvailableWidgetsResponseModel>(`${this.baseUrl}/AvailableWidgets`)
      .pipe(map((response: AvailableWidgetsResponseModel) => response.widgetTypes));
  }

  private getCandidatesWidgetData(filter: DashboardFiltersModel): Observable<ChartAccumulation> {
    return this.httpClient.post<CandidateTypeInfoModel[]>(`${this.baseUrl}/GetCandidatesByStatuses`, {}).pipe(
      map((candidatesInfo: CandidateTypeInfoModel[]) => {
        return {
          id: WidgetTypeEnum.CANDIDATES,
          title: 'Candidates',
          chartData: lodashMapPlain(candidatesInfo, ({ count, status }: CandidateTypeInfoModel, index: number) => ({
            label: status,
            value: count,
            color: legendPalette[index % legendPalette.length],
          })),
        };
      })
    );
  }

  private getApplicantsByRegionWidgetData(
    filters: DashboardFiltersModel
  ): Observable<CandidatesByStateWidgetAggregatedDataModel> {
    return this.httpClient
      .post<CandidatesByStatesResponseModel>('/api/Dashboard/GetCandidatesStatesAggregated', {})
      .pipe(
        map((candidatesByStates: CandidatesByStatesResponseModel) => {
          return this.getFormattedCandidatesByStatesWidgetAggregatedData(candidatesByStates);
        })
      );
  }

  private getFormattedCandidatesByStatesWidgetAggregatedData(
    candidatesByStates: CandidatesByStatesResponseModel
  ): CandidatesByStateWidgetAggregatedDataModel {
    const maxCandidatesValue = flow(values, max)(candidatesByStates);
    const dataSource = lodashMap(
      (stateDefinition: Record<string, string>) => ({
        ...stateDefinition,
        candidates: candidatesByStates[stateDefinition['code']] ?? 0,
      }),
      USAMapCandidatesDataLayerSettings.dataSource
    );
    const shapeSettings = {
      ...USAMapCandidatesDataLayerSettings.shapeSettings,
      colorMapping: [{ from: 0, to: maxCandidatesValue, color: ['#ecf2ff', '#2368ee'] }],
    };

    return { chartData: [{ ...USAMapCandidatesDataLayerSettings, dataSource, shapeSettings }] };
  }

  private getDashboardState(): Observable<PanelModel[]> {
    return this.httpClient
      .get<DashboardStateDto>(`${this.baseUrl}/GetState`)
      .pipe(map((panels) => JSON.parse(panels.state)));
  }
}
