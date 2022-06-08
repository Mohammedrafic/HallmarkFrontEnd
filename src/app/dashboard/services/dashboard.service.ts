import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import lodashMap from 'lodash/fp/map';

import { PanelModel } from '@syncfusion/ej2-angular-layouts';
import { Observable, of, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { tap } from 'rxjs';

import { ChartAccumulation } from '../models/chart-accumulation-widget.model';
import { ChartLineDataModel } from '../models/chart-line-widget.model';
import { WidgetDataDependenciesAggregatedModel } from '../models/widget-data-dependencies-aggregated.model';
import { DashboardFiltersModel } from '../models/dashboard-filters.model';
import { WidgetTypeEnum } from '../enums/widget-type.enum';
import { CandidatesByStatesResponseModel } from '../models/candidates-by-states-response.model';
import { CandidatesByStateWidgetAggregatedDataModel } from '../models/candidates-by-state-widget-aggregated-data.model';
import { DashboardStateDto } from '../models/dashboard-state-dto.model';
import { USAMapCandidatesDataLayerSettings } from '../constants/USA-map-candidates-data-layer-settings';
import reduce from 'lodash/reduce';

@Injectable()
export class DashboardService {
  private readonly baseUrl = '/api/Dashboard';
  private readonly widgetTypeToDataMapper: Record<
    WidgetTypeEnum,
    (filters: DashboardFiltersModel) => Observable<unknown>
  > = {
    [WidgetTypeEnum.CANDIDATES]: (filters: DashboardFiltersModel) => this.getCandidatesWidgetData(filters),
    [WidgetTypeEnum.CANDIDATES_BY_STATE]: (filters: DashboardFiltersModel) =>
      this.getCandidatesByStateWidgetData(filters),
    [WidgetTypeEnum.INVOICES]: (filters: DashboardFiltersModel) => this.getInvoicesWidgetData(filters),
    [WidgetTypeEnum.ORDERS_VS_CANDIDATES]: (filters: DashboardFiltersModel) => this.getCandidatesWidgetData(filters),
  };

  constructor(private httpClient: HttpClient) {}

  getDashboardsPanels(): Observable<PanelModel[]> {
    // return of([
    //   { id: WidgetTypeEnum.CANDIDATES, sizeX: 3, sizeY: 3, row: 0, col: 3 },
    //   { id: WidgetTypeEnum.ORDERS_VS_CANDIDATES, sizeX: 3, sizeY: 3, row: 0, col: 6 },
    //   { id: WidgetTypeEnum.CANDIDATES_BY_STATE, sizeX: 3, sizeY: 3, row: 0, col: 9 },
    //   { id: WidgetTypeEnum.INVOICES, sizeX: 3, sizeY: 3, row: 1, col: 0 },
    // ]);
    return this.httpClient
      .get<DashboardStateDto>(`${this.baseUrl}/GetState`)
      .pipe(map((panels) => JSON.parse(panels.state)));
  }

  addDashboardPanel(panel: PanelModel[]): Observable<PanelModel[]> {
    return of(panel);
  }

  saveDashboard(dashboard: PanelModel[]): Observable<Object> {
    const dasboardState = JSON.stringify(dashboard);
    return this.httpClient.post(`${this.baseUrl}/SaveState`, { dasboardState });
  }

  getChartLineWidgets(): ChartLineDataModel {
    return {
      chart_line_1: {
        id: 'chart_line_1',
        name: 'Pending Orders',
        progress: 1,
        value: 4.53,
        score: 0.45,
        chartData: [
          { x: 1, y: 30 },
          { x: 2, y: 28 },
          { x: 3, y: 35 },
          { x: 4, y: 28 },
          { x: 5, y: 33 },
          { x: 6, y: 32 },
          { x: 7, y: 30 },
        ],
      },

      chart_line_2: {
        id: 'chart_line_2',
        name: 'Bill Rate Fluctoation',
        progress: -1,
        value: 4.53,
        score: 0.45,
        chartData: [
          { x: 1, y: 30 },
          { x: 2, y: 28 },
          { x: 3, y: 35 },
          { x: 4, y: 28 },
          { x: 5, y: 40 },
          { x: 6, y: 32 },
          { x: 7, y: 35 },
        ],
      },

      chart_line_3: {
        id: 'chart_line_3',
        name: 'Orders Starting in the Future',
        progress: 1,
        value: 14.53,
        score: 129,
        chartData: [
          { x: 1, y: 38 },
          { x: 2, y: 40 },
          { x: 3, y: 39 },
          { x: 4, y: 42 },
          { x: 5, y: 45 },
          { x: 6, y: 43 },
          { x: 7, y: 48 },
        ],
      },
    };
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

  private getCandidatesWidgetData(filter: DashboardFiltersModel): Observable<ChartAccumulation> {
    return of({
      id: WidgetTypeEnum.CANDIDATES,
      title: 'Candidates',
      candidates: 35,
      score: 14.53,
      progress: 4,
      chartData: [
        { x: 'Applied', y: 45, text: '45%' },
        { x: 'Offered', y: 15, text: '15%' },
        { x: 'Accepted', y: 12, text: '9%' },
        { x: 'Onboarded', y: 11, text: '31%' },
      ],
    });
  }

  private getCandidatesByStateWidgetData(
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
    return {
      chartData: [
        {
          ...USAMapCandidatesDataLayerSettings,
          dataSource: lodashMap(
            (stateDefinition: Record<string, string>) => ({
              ...stateDefinition,
              candidates: candidatesByStates[stateDefinition['code']] ?? 0,
            }),
            USAMapCandidatesDataLayerSettings.dataSource
          ),
        },
      ],
      legendData: [{ label: '0 - 2' }, { label: '2 - 4' }, { label: '4 - 6' }, { label: '6+' }],
    };
  }

  private getInvoicesWidgetData(filter: DashboardFiltersModel): Observable<ChartAccumulation> {
    return of({
      id: WidgetTypeEnum.INVOICES,
      title: 'Job Offers',
      score: 14.53,
      candidates: 15,
      progress: -4,
      chartData: [
        { x: 'Open', y: 4, text: '4%' },
        { x: 'In Progress', y: 65, text: '65%' },
        { x: 'In Progress (Offer Pending)', y: 19, text: '19%' },
        { x: 'In Progress (Offer Accepted)', y: 24, text: '24%' },
      ],
    });
  }
}
