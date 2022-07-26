import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import lodashMap from 'lodash/fp/map';
import lodashMapPlain from 'lodash/map';

import { PanelModel } from '@syncfusion/ej2-angular-layouts';
import { AccumulationChartModel } from '@syncfusion/ej2-angular-charts';
import type { LayerSettingsModel } from '@syncfusion/ej2-angular-maps';
import { catchError, forkJoin, Observable, of } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import flow from 'lodash/fp/flow';
import values from 'lodash/fp/values';
import max from 'lodash/fp/max';
import find from 'lodash/fp/find';
import lodashFilter from 'lodash/fp/filter';
import identity from 'lodash/fp/identity';
import reduce from 'lodash/reduce';

import { ChartAccumulation } from '../models/chart-accumulation-widget.model';
import { WidgetDataDependenciesAggregatedModel } from '../models/widget-data-dependencies-aggregated.model';
import { DashboardFiltersModel } from '../models/dashboard-filters.model';
import { WidgetTypeEnum } from '../enums/widget-type.enum';
import { CandidatesByStatesResponseModel } from '../models/candidates-by-states-response.model';
import { CandidatesByStateWidgetAggregatedDataModel } from '../models/candidates-by-state-widget-aggregated-data.model';
import { DashboardStateDto } from '../models/dashboard-state-dto.model';
import { USAMapCandidatesDataLayerSettings } from '../constants/USA-map-candidates-data-layer-settings';
import { CandidateTypeInfoModel } from '../models/candidate-type-info.model';
import { AvailableWidgetsResponseModel, WidgetOptionModel } from '../models/widget-option.model';
import { DashboardDataModel } from '../models/dashboard-data.model';
import type { ApplicantsByRegionDataModel } from '../models/applicants-by-region-data.model';
import type { WidgetsDataModel } from '../models/widgets-data.model';
import { PositionTypeEnum } from '../enums/position-type.enum';
import type {
  ITimeSlice,
  PositionByTypeDataModel,
  PositionsByTypeAggregatedModel,
} from '../models/positions-by-type-aggregated.model';
import { CandidatesPositionDataModel } from '../models/candidates-positions.model';
import { CandidatesPositionsDto } from '../models/candidates-positions-dto.model';
import { OrderStatus } from '@shared/enums/order-management';
import { ActivePositionsDto, ActivePositionTypeInfo } from '../models/active-positions-dto.model';
import { MONTHS } from '../constants/months';
import { PositionByTypeDto, PositionsByTypeResponseModel } from '../models/positions-by-type-response.model';
import { widgetTypes } from '../constants/widget-types';

import { activePositionsLegendPalette } from '../constants/active-positions-legend-palette';
import { ActivePositionsChartStatuses } from '../enums/active-positions-legend-palette.enum';
import { candidateLegendPalette } from '../constants/candidate-legend-palette';
import { CandidateChartStatuses } from '../enums/candidate-legend-palette.enum';
import { Router } from '@angular/router';
import { PositionTrend, PositionTrendDto } from '../models/position-trend.model';
import { TimeSelectionEnum } from '../enums/time-selection.enum';

@Injectable()
export class DashboardService {
  private readonly baseUrl = '/api/Dashboard';
  private readonly widgetTypeToDataMapper: Record<
    WidgetTypeEnum,
    (filters: DashboardFiltersModel, timeSelection: TimeSelectionEnum) => Observable<unknown>
  > = {
      [WidgetTypeEnum.APPLICANTS_BY_REGION]: (filters: DashboardFiltersModel) => this.getApplicantsByRegionWidgetData(filters),
      [WidgetTypeEnum.APPLICANTS_BY_POSITIONS]: (filters: DashboardFiltersModel) => this.getApplicantsByPositionsWidgetData(filters),
    [WidgetTypeEnum.ACTIVE_POSITIONS]: (filters: DashboardFiltersModel) => this.getActivePositionWidgetData(filters),
    [WidgetTypeEnum.CANDIDATES]: (filters: DashboardFiltersModel) => this.getCandidatesWidgetData(filters),
    [WidgetTypeEnum.FILLED_POSITIONS_TREND]: (filters: DashboardFiltersModel) => this.getFilledPositionTrendWidgetData(filters),
    [WidgetTypeEnum.IN_PROGRESS_POSITIONS]: (filters: DashboardFiltersModel) => this.getOrderPositionWidgetData(filters, OrderStatus.InProgress),
    [WidgetTypeEnum.POSITIONS_BY_TYPES]: (filters: DashboardFiltersModel, timeSelection: TimeSelectionEnum) => this.getPositionsByTypes(filters, timeSelection),
    [WidgetTypeEnum.FILLED_POSITIONS]: (filters: DashboardFiltersModel) => this.getOrderPositionWidgetData(filters, OrderStatus.Filled),
    [WidgetTypeEnum.OPEN_POSITIONS]: (filters,) => this.getOrderPositionWidgetData(filters, OrderStatus.Open),
    [WidgetTypeEnum.INVOICES]: () => this.getInvocesWidgetData(),
    [WidgetTypeEnum.TASKS]: () => this.getTasksWidgetData(),
    [WidgetTypeEnum.CHAT]: () => this.getChatWidgetData(),
  };

  private readonly mapData$: Observable<LayerSettingsModel> = this.getMapData();

  constructor(private readonly httpClient: HttpClient, private readonly router: Router) {}

  public getDashboardsData(): Observable<DashboardDataModel> {
    return forkJoin({ panels: this.getDashboardState(), widgets: this.getWidgetList() }).pipe(
      map(({ panels, widgets }: DashboardDataModel) => {
        const availablePanels = flow(
          lodashMap((widget: WidgetOptionModel) => find((panel: PanelModel) => panel.id === widget.id, panels)),
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

  public getWidgetsAggregatedData([
    panels,
    filters,
    timeSelection
  ]: WidgetDataDependenciesAggregatedModel): Observable<WidgetsDataModel> {
    const data: Record<WidgetTypeEnum, Observable<WidgetsDataModel[keyof WidgetsDataModel]>> = reduce(
      panels,
      (
        accumulator: Partial<Record<WidgetTypeEnum, Observable<WidgetsDataModel[keyof WidgetsDataModel]>>>,
        panel: PanelModel
      ) => ({
        ...accumulator,
        [panel.id as WidgetTypeEnum]: this.widgetTypeToDataMapper[panel.id as WidgetTypeEnum]?.(filters, timeSelection) ?? of(null),
      }),
      {}
    ) as Record<WidgetTypeEnum, Observable<WidgetsDataModel[keyof WidgetsDataModel]>>;

    return forkJoin(data) as Observable<WidgetsDataModel>;
  }

  private getWidgetList(): Observable<WidgetOptionModel[]> {
    return this.httpClient.get<AvailableWidgetsResponseModel>(`${this.baseUrl}/AvailableWidgets`).pipe(
      map((response: AvailableWidgetsResponseModel) =>
        response.widgetTypes.map((widget: WidgetOptionModel) => {
          return {
            ...widget,
            id: widgetTypes[widget.widgetType],
          };
        })
      )
    );
  }

  private getCandidatesWidgetData(filter: DashboardFiltersModel): Observable<ChartAccumulation> {
    return this.httpClient.post<CandidateTypeInfoModel[]>(`${this.baseUrl}/GetCandidatesByStatuses`, { ...filter }).pipe(
      map((candidatesInfo: CandidateTypeInfoModel[]) => {
        return {
          id: WidgetTypeEnum.CANDIDATES,
          title: 'Candidates',
          chartData: lodashMapPlain(candidatesInfo, ({ count, status }: CandidateTypeInfoModel, index: number) => ({
            label: status,
            value: count,
            color:
              candidateLegendPalette[status as CandidateChartStatuses] ||
              candidateLegendPalette[CandidateChartStatuses.CUSTOM],
          })),
        };
      })
    );
  }

  private getApplicantsByRegionWidgetData(
    filters: DashboardFiltersModel
  ): Observable<CandidatesByStateWidgetAggregatedDataModel> {
    return forkJoin({ mapData: this.mapData$, applicantsByRegion: this.getApplicantsByRegion(filters) }).pipe(
      map((data: ApplicantsByRegionDataModel) => {
        return this.getFormattedCandidatesByStatesWidgetAggregatedData(data);
      })
    );
  }

  private getApplicantsByPositionsWidgetData(
    filters: DashboardFiltersModel
  ): Observable<CandidatesByStateWidgetAggregatedDataModel> {
    return forkJoin({ mapData: this.mapData$, applicantsByRegion: this.getApplicantsByPositions(filters) }).pipe(
      map((data: ApplicantsByRegionDataModel) => {
        return this.getFormattedPostionsByStatesWidgetAggregatedData(data);
      })
    );
  }

  private getApplicantsByRegion(filter: DashboardFiltersModel): Observable<CandidatesByStatesResponseModel> {
    return this.httpClient.post<CandidatesByStatesResponseModel>(`${this.baseUrl}/GetCandidatesStatesAggregated`, { ...filter });
  }

  private getApplicantsByPositions(filter: DashboardFiltersModel): Observable<CandidatesByStatesResponseModel> {
    return this.httpClient.post<CandidatesByStatesResponseModel>(`${this.baseUrl}/GetPostionsStatesAggregated`, { ...filter });
  }

  private getMapData(): Observable<LayerSettingsModel> {
    return this.httpClient.get('assets/geoJSON/USA-states/USA-states-layer-settings.json').pipe(shareReplay(1));
  }

  private getFormattedCandidatesByStatesWidgetAggregatedData({
    mapData,
    applicantsByRegion,
  }: ApplicantsByRegionDataModel): CandidatesByStateWidgetAggregatedDataModel {
    const candidatesWithState = flow([
      Object.entries,
      (arr) => arr.filter(([key, value]: [key: string, value: number]) => key !== 'Unknown'),
      Object.fromEntries,
    ])(applicantsByRegion);
    const maxCandidatesValue = flow(values, max)(candidatesWithState);
    const unknownStateCandidates = applicantsByRegion['Unknown'];
    const title = "Applicants by Region";
    const description = "";
    const combinedData = { ...mapData, ...USAMapCandidatesDataLayerSettings };
    const dataSource = lodashMap(
      (stateDefinition: Record<string, string>) => ({
        ...stateDefinition,
        candidates: applicantsByRegion[stateDefinition['code']] ?? 0,
      }),
      combinedData.dataSource
    );
    const shapeSettings = {
      ...combinedData.shapeSettings,
      colorMapping: [{ from: 0, to: maxCandidatesValue, color: ['#ecf2ff', '#2368ee'] }],
    };

    return { chartData: [{ ...combinedData, dataSource, shapeSettings }], unknownStateCandidates, title, description };
  }
  private getFormattedPostionsByStatesWidgetAggregatedData({
    mapData,
    applicantsByRegion,
  }: ApplicantsByRegionDataModel): CandidatesByStateWidgetAggregatedDataModel {
    const candidatesWithState = flow([
      Object.entries,
      (arr) => arr.filter(([key, value]: [key: string, value: number]) => key !== 'Unknown'),
      Object.fromEntries,
    ])(applicantsByRegion);
    const maxCandidatesValue = flow(values, max)(candidatesWithState);
    const unknownStateCandidates = applicantsByRegion['Unknown'];
    const title = "Open Positions";
    const description = "Open and in progress Position by  State";
    
    const combinedData = { ...mapData, ...USAMapCandidatesDataLayerSettings };
    const dataSource = lodashMap(
      (stateDefinition: Record<string, string>) => ({
        ...stateDefinition,
        candidates: applicantsByRegion[stateDefinition['code']] ?? 0,
      }),
      combinedData.dataSource
    );
    const shapeSettings = {
      ...combinedData.shapeSettings,
      colorMapping: [{ from: 0, to: maxCandidatesValue, color: ['#ecf2ff', '#2368ee'] }],
    };

    return { chartData: [{ ...combinedData, dataSource, shapeSettings }], unknownStateCandidates, title, description };
  }

  private getDashboardState(): Observable<PanelModel[]> {
    return this.httpClient
      .get<DashboardStateDto>(`${this.baseUrl}/GetState`)
      .pipe(map((panels) => JSON.parse(panels.state)));
  }

  private getPositionsByTypes(filter: DashboardFiltersModel, timeSelection: TimeSelectionEnum): Observable<PositionsByTypeAggregatedModel> {
    const timeRanges = this.calculateTimeRanges(timeSelection);
    return this.httpClient
      .post<PositionsByTypeResponseModel>(`${this.baseUrl}/getopenclosedonboardamount`, { ...timeRanges, ...filter })
      .pipe(
        map((positions: PositionsByTypeResponseModel) => {
          return {
            [PositionTypeEnum.OPEN]: this.convertDtoToPositionTypes(positions.openJobs),
            [PositionTypeEnum.ONBOARD]: this.convertDtoToPositionTypes(positions.onboardCandidates),
            [PositionTypeEnum.CLOSED]: this.convertDtoToPositionTypes(positions.closedJobs),
          };
        })
      );
  }

  private getWeeksTimeRanges(week: number): ITimeSlice {
    const numberWeek = week * 7;
    const today = new Date();
    const startDate = this.getDateAsISOString(new Date(today.getFullYear(), today.getMonth(), today.getDate() - numberWeek).getTime());
    const endDate = this.getDateAsISOString(new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime());
    return {startDate, endDate};
  }

  private getMonthTimeRanges(month: number): ITimeSlice{
    const date = new Date();
    const startDate = this.getDateAsISOString(date.setMonth(date.getMonth() - month + 1));
    const endDate = this.getDateAsISOString(date.setMonth(date.getMonth() + month));
    return { startDate, endDate };
  }

  private calculateTimeRanges(timeSelection: TimeSelectionEnum) {
    if(timeSelection === TimeSelectionEnum.Weekly) {
      return this.getWeeksTimeRanges(5);
    } else {
      return this.getMonthTimeRanges(5);
    }  
  }

  private getDateAsISOString(timestamp: number): string {
    return new Date(timestamp).toISOString();
  }

  private convertDtoToPositionTypes(data: PositionByTypeDto[]): PositionByTypeDataModel[] {
    return data.map(({ month, value }: PositionByTypeDto) => ({
      month: MONTHS[month],
      value,
    }));
  }

  private getOrderPositionWidgetData(filter: DashboardFiltersModel, orderStatus: OrderStatus): Observable<CandidatesPositionDataModel> {
    return this.httpClient
      .post<CandidatesPositionsDto>(`${this.baseUrl}/OrdersPositionsStatus`, { orderStatuses: [orderStatus], ...filter })
      .pipe(map((data) => data.orderStatusesDetails[0]));
  }

  private getActivePositionWidgetData(filter: DashboardFiltersModel): Observable<AccumulationChartModel> {
    return this.httpClient.post<ActivePositionsDto>(`${this.baseUrl}/OrdersPositionsStatus`, { granulateInProgress: true, ...filter }).pipe(
      map(({ orderStatusesDetails }: ActivePositionsDto) => {
        return {
          id: WidgetTypeEnum.ACTIVE_POSITIONS,
          title: 'Active Positions',
          chartData: lodashMapPlain(
            orderStatusesDetails,
            ({ count, statusName }: ActivePositionTypeInfo, index: number) => ({
              label: statusName,
              value: count,
              color: activePositionsLegendPalette[statusName as ActivePositionsChartStatuses],
            })
          ),
        };
      })
    );
  }

  public redirectToUrl(url: string): void {
    this.router.navigate([url], { state: { redirectedFromDashboard: true } });
  }

  private getTasksWidgetData(): Observable<string> {
    return of('temporary-collapsed-widget-tasks');
  }

  private getChatWidgetData(): Observable<string> {
    return of('assets/icons/temporary-widget-chat.png');
  }

  private getFilledPositionTrendWidgetData(filter: DashboardFiltersModel): Observable<PositionTrend> {
    return this.httpClient.post<PositionTrendDto>(`${this.baseUrl}/filledpositionstrend`, { ...filter }).pipe(
      map((data: PositionTrendDto) => {
        const [previousValue, currentValue] = data.values.slice(-2);
        const coefficient = previousValue === 0 ? 1 : previousValue;

        return {
          id: WidgetTypeEnum.FILLED_POSITIONS_TREND,
          percentRatio: ((currentValue - previousValue) / coefficient) * 100,
          total: data.total,
          chartData: data.values.map((item: number, index: number) => ({ x: index, y: item })),
        };
      })
    );
  }

  private getInvocesWidgetData(): Observable<any> {
    return of('temporary-widget-invoices');
  }
}
