import { HttpClient, HttpHeaders } from '@angular/common/http';
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
import { PositionTrendTypeEnum } from '../enums/position-trend-type.enum';
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

import { activePositionsLegendDisplayText, activePositionsLegendPalette } from '../constants/active-positions-legend-palette';
import { ActivePositionsChartStatuses } from '../enums/active-positions-legend-palette.enum';
import { candidateLegendPalette } from '../constants/candidate-legend-palette';
import { CandidateChartStatuses } from '../enums/candidate-legend-palette.enum';
import { Router } from '@angular/router';
import { PositionTrend, PositionTrendDto } from '../models/position-trend.model';
import { TimeSelectionEnum } from '../enums/time-selection.enum';
import { DashboartFilterDto } from '../models/dashboard-filter-dto.model';
import { AllOrganizationsSkill } from '../models/all-organization-skill.model';
import { DateTimeHelper } from '@core/helpers';
import { sortByField } from '@shared/helpers/sort-by-field.helper';
import { AssignedSkillsByOrganization } from '@shared/models/skill.model';
import { CandidateStatusDataModel } from '../models/candidate-status-dto.model';
import { ApplicantStatus } from '@shared/enums/applicant-status.enum';
import { OrgDetailsInfoModel } from '../models/org-details-info.model';
import { AgencyPositionModel } from '../models/agency-position.model';
import { ExpiryDetailsModel } from '../models/expiry.model';
import { RnUtilizationModel } from '../models/rnutilization.model';
import { GetNursingUtilizationbyByFilters, GetNursingWidgetData, GetWorkCommitment } from '../models/rn-utilization.model';

@Injectable()
export class DashboardService {
  private readonly baseUrl = '/api/Dashboard';
  private readonly widgetTypeToDataMapper: Record<
    WidgetTypeEnum,
    (filters: DashboartFilterDto, timeSelection: TimeSelectionEnum) => Observable<unknown>
  > = {
    [WidgetTypeEnum.APPLICANTS_BY_REGION]: (filters: DashboartFilterDto) => this.getApplicantsByRegionWidgetData(filters),
    [WidgetTypeEnum.APPLICANTS_BY_POSITIONS]: (filters: DashboartFilterDto) => this.getApplicantsByPositionsWidgetData(filters),
    [WidgetTypeEnum.ACTIVE_POSITIONS]: (filters: DashboartFilterDto) => this.getActivePositionWidgetData(filters),
    [WidgetTypeEnum.CANDIDATES]: (filters: DashboartFilterDto) => this.getCandidatesWidgetData(filters),
    [WidgetTypeEnum.FILLED_POSITIONS_TREND]: (filters: DashboartFilterDto) => this.getFilledPositionTrendWidgetData(filters),
    [WidgetTypeEnum.IN_PROGRESS_POSITIONS]: (filters: DashboartFilterDto) => this.getOrderPositionWidgetData(filters, OrderStatus.InProgress),
    [WidgetTypeEnum.POSITIONS_BY_TYPES]: (filters: DashboartFilterDto, timeSelection: TimeSelectionEnum) => this.getPositionsByTypes(filters, timeSelection),
    [WidgetTypeEnum.FILLED_POSITIONS]: (filters: DashboartFilterDto) => this.getOrderPositionWidgetData(filters, OrderStatus.Filled),
    [WidgetTypeEnum.OPEN_POSITIONS]: (filters) => this.getOrderPositionWidgetData(filters, OrderStatus.Open),
    [WidgetTypeEnum.INVOICES]: () => this.getInvocesWidgetData(),
    [WidgetTypeEnum.TASKS]: () => this.getTasksWidgetData(),
    [WidgetTypeEnum.CHAT]: () => this.getChatWidgetData(),
    [WidgetTypeEnum.OPEN_POSITIONS_TREND]: (filters: DashboartFilterDto) => this.getOpenPositionTrendWidgetData(filters),
    [WidgetTypeEnum.IN_PROGRESS_POSITIONS_TREND]: (filters: DashboartFilterDto) => this.getInProgressPositionTrendWidgetData(filters),
    [WidgetTypeEnum.LTA_ORDER_ENDING]: (filters: DashboartFilterDto) => this.getLTAOrderEndingWidgetData(filters, OrderStatus.Closed),
    [WidgetTypeEnum.Candidate_Applied_In_Last_N_Days]: (filters: DashboartFilterDto) => this.getCandidateAppliedInLastNDays(filters, ApplicantStatus.Applied),
    [WidgetTypeEnum.ORG]: (filters: DashboartFilterDto) => this.getOrganizationWidgetdata(filters),
    [WidgetTypeEnum.AGENCY_POSITION_COUNT]: (filters: DashboartFilterDto) => this.getAgencyPositionCount(filters),
    [WidgetTypeEnum.RN_UTILIZATION]: (filters: DashboartFilterDto) => of(null), //Empty loader. Data is loaded in the component due to load order for lookups
    [WidgetTypeEnum.ALREADY_EXPIRED_CREDS]: (filters: DashboartFilterDto) => this.getalreadyExpiredCredentials(filters),
    [WidgetTypeEnum.UPCOMING_EXP_CREDS]: (filters: DashboartFilterDto) => this.getupcomingExpiredCredentials(filters),
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

  private getCandidatesWidgetData(filter: DashboartFilterDto): Observable<ChartAccumulation> {
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
    filters: DashboartFilterDto
  ): Observable<CandidatesByStateWidgetAggregatedDataModel> {
    return forkJoin({ mapData: this.mapData$, applicantsByRegion: this.getApplicantsByRegion(filters) }).pipe(
      map((data: ApplicantsByRegionDataModel) => {
        return this.getFormattedCandidatesByStatesWidgetAggregatedData(data);
      })
    );
  }

  private getApplicantsByPositionsWidgetData(
    filters: DashboartFilterDto
  ): Observable<CandidatesByStateWidgetAggregatedDataModel> {
    return forkJoin({ mapData: this.mapData$, applicantsByRegion: this.getApplicantsByPositions(filters) }).pipe(
      map((data: ApplicantsByRegionDataModel) => {
        return this.getFormattedPostionsByStatesWidgetAggregatedData(data);
      })
    );
  }

  private getApplicantsByRegion(filter: DashboartFilterDto): Observable<CandidatesByStatesResponseModel> {
    return this.httpClient.post<CandidatesByStatesResponseModel>(`${this.baseUrl}/GetCandidatesStatesAggregated`, { ...filter });
  }

  private getApplicantsByPositions(filter: DashboartFilterDto ): Observable<CandidatesByStatesResponseModel> {
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
    const title = "Applicant’s Home State";
    const description = "";
    return { chartData: [{ ...combinedData, dataSource, shapeSettings }], unknownStateCandidates,title,description };
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
    const title = "Active Positions - LTA";
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

  private getPositionsByTypes(filter: DashboartFilterDto, timeSelection: TimeSelectionEnum): Observable<PositionsByTypeAggregatedModel> {
    const timeRanges = this.calculateTimeRanges(timeSelection);
    return this.httpClient
      .post<PositionsByTypeResponseModel>(`${this.baseUrl}/getopenclosedonboardamount`, { ...timeRanges, ...filter, rangeType: timeSelection})
      .pipe(
        map((positions: PositionsByTypeResponseModel) => {
          return {
            [PositionTrendTypeEnum.OPEN]: this.convertDtoToPositionTypes(positions.openJobs, timeSelection),
            [PositionTrendTypeEnum.FILLED]: this.convertDtoToPositionTypes(positions.onboardCandidates, timeSelection),
            [PositionTrendTypeEnum.CLOSED]: this.convertDtoToPositionTypes(positions.closedJobs, timeSelection),
            [PositionTrendTypeEnum.IN_PROGRESS]: this.convertDtoToPositionTypes(positions.inProgressJobs, timeSelection),
          };
        })
      );
  }

  private convertDtoToPositionTypes(data: PositionByTypeDto[], timeSelection: TimeSelectionEnum): PositionByTypeDataModel[] {
    return data.map(({ dateIndex, value }: PositionByTypeDto) => ({
      month: timeSelection === TimeSelectionEnum.Monthly ? MONTHS[dateIndex] : `W${dateIndex}`,
      value,
    }));
  }

  private getWeeksTimeRanges(week: number): ITimeSlice {
    const numberWeek = week * 7;
    const today = new Date();
    const sixWeeksAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - numberWeek);
    const timeRanges = this.getFirstLastWeekDay(sixWeeksAgo);
    return { ...timeRanges };
  }


  private getFirstLastWeekDay(startDate: Date): ITimeSlice {
    const today = new Date();
    const dateFrom = DateTimeHelper.toUtcFormat(new Date(startDate.setDate(startDate.getDate() - startDate.getDay())));
    const dateTo = DateTimeHelper.toUtcFormat(new Date(today.setDate(today.getDate() - today.getDay() + 6)));
    return { dateFrom, dateTo };
  }

  private getFirstLastMonthDay(startDate: Date): ITimeSlice {
    const today = new Date();
    const dateFrom = DateTimeHelper.toUtcFormat(new Date(new Date(startDate.getFullYear(), startDate.getMonth(), 1)));
    const dateTo =  DateTimeHelper.toUtcFormat(new Date(new Date(today.getFullYear(), today.getMonth() + 1, 0)));
    return { dateFrom, dateTo };
  }

  private getMonthTimeRanges(month: number): ITimeSlice {
    const date = new Date();
    const  timeRanges  = this.getFirstLastMonthDay(new Date(date.setMonth(date.getMonth() - month)));
    return { ...timeRanges };
  }

  private calculateTimeRanges(timeSelection: TimeSelectionEnum): ITimeSlice {
    if(timeSelection === TimeSelectionEnum.Weekly) {
      return this.getWeeksTimeRanges(5);
    } else {
      return this.getMonthTimeRanges(5);
    }
  }

  private getOrderPositionWidgetData(filter: DashboartFilterDto, orderStatus: OrderStatus): Observable<CandidatesPositionDataModel> {
    return this.httpClient
      .post<CandidatesPositionsDto>(`${this.baseUrl}/OrdersPositionsStatus`, { orderStatuses: [orderStatus], ...filter })
      .pipe(map((data) => data.orderStatusesDetails[0]));
  }

  private getLTAOrderEndingWidgetData(filter: DashboartFilterDto, orderStatus: OrderStatus): Observable<CandidatesPositionDataModel> {
    return this.httpClient
      .post<CandidatesPositionsDto>(`${this.baseUrl}/ltaorderending`, { orderStatuses: [orderStatus], ...filter })
      .pipe(map((data) => data.orderStatusesDetails[0]));
  }
  private getOrganizationWidgetdata(filter: DashboartFilterDto) : Observable<OrgDetailsInfoModel> {
    return this.httpClient.post<OrgDetailsInfoModel>(`${this.baseUrl}/organizationpendingcounts`, { ...filter }).pipe(
      map((data)=> data)
    )
  }
  private getAgencyPositionCount(filter: DashboartFilterDto) : Observable<AgencyPositionModel[]> {
    return this.httpClient.post<AgencyPositionModel[]>(`${this.baseUrl}/getOpenAndInprogressOpenPositions`, { ...filter }).pipe(
      map((data)=> data)
    )
  }

  private getalreadyExpiredCredentials(filter: DashboartFilterDto) : Observable<ExpiryDetailsModel[]> {
    return this.httpClient.post<ExpiryDetailsModel[]>(`${this.baseUrl}/get-expiry-tracking`, { ...filter }).pipe(
      map((data)=> data)
    );
  }

  private getupcomingExpiredCredentials(filter: DashboartFilterDto) : Observable<ExpiryDetailsModel[]> {
    return this.httpClient.post<ExpiryDetailsModel[]>(`${this.baseUrl}/get-expiry-tracking`, { ...filter }).pipe(
      map((data)=> data)
    );
  }

  private getActivePositionWidgetData(filter: DashboartFilterDto): Observable<AccumulationChartModel> {
    return this.httpClient.post<ActivePositionsDto>(`${this.baseUrl}/OrdersPositionsStatus`, { granulateInProgress: true, ...filter }).pipe(
      map(({ orderStatusesDetails }: ActivePositionsDto) => {
        return {
          id: WidgetTypeEnum.ACTIVE_POSITIONS,
          title: 'Active Positions',
          chartData: lodashMapPlain(
            orderStatusesDetails,
            ({ count, statusName }: ActivePositionTypeInfo, index: number) => ({
              label: activePositionsLegendDisplayText[statusName as ActivePositionsChartStatuses],
              value: count,
              color: activePositionsLegendPalette[statusName as ActivePositionsChartStatuses],
            })
          ),
        };
      })
    );
  }

  public redirectToUrl(url: string,orderStatus? :number,status? : string): void {
    this.router.navigate([url], { state: { redirectedFromDashboard: true , orderStatus: orderStatus,status: status} });
  }
  public redirectToUrlWithCandidateStatus(url: string,orderStatus? :number,orderstatustext? : string,candidateStatusId? :number,candidateStatus?:string): void {
    this.router.navigate([url], { state: { redirectedFromDashboard: true , orderStatus: orderStatus,status: orderstatustext,candidateStatusId:candidateStatusId,candidateStatus:candidateStatus} });
  }
  public redirectToUrlWithAgencyposition(url: string,orderStatus? :number,condition? : string): void {
    this.router.navigate([url], { state: { redirectedFromDashboard: true , orderStatus: orderStatus,condition: condition} });
  }
  public redirect_to_credentials(url : string, startDate? : Date, endDate? : Date, type? : number) : void {
    this.router.navigate([url], { state: { redirectedFromDashboard: true , startDate: startDate,endDate: endDate, type : type} });
  }
  private getTasksWidgetData(): Observable<string> {
    return of('temporary-collapsed-widget-tasks');
  }

  private getChatWidgetData(): Observable<string> {
    return of('assets/icons/temporary-widget-chat.png');
  }

  private getFilledPositionTrendWidgetData(filter: DashboartFilterDto): Observable<PositionTrend> {
    return this.httpClient.post<PositionTrendDto>(`${this.baseUrl}/filledpositionstrend`, { ...filter }).pipe(
      map((data: PositionTrendDto) => {
        const [previousValue, currentValue] = data.values.slice(-2);
        const coefficient = previousValue === 0 ? 1 : previousValue;
        const title = "Filled Position Trend";
        const description = "Filled Position Trend";
        return {
          id: WidgetTypeEnum.FILLED_POSITIONS_TREND,
          percentRatio: ((currentValue - previousValue) / coefficient) * 100,
          total: data.total,
          chartData: data.values.map((item: number, index: number) => ({ x: index, y: item })),
          title: title,
          description: description
        };
      })
    );
  }

  private getOpenPositionTrendWidgetData(filter: DashboartFilterDto): Observable<PositionTrend> {
    return this.httpClient.post<PositionTrendDto>(`${this.baseUrl}/getopenpositiontrend`, { ...filter }).pipe(
      map((data: PositionTrendDto) => {
        const [previousValue, currentValue] = data.values.slice(-2);
        const coefficient = previousValue === 0 ? 1 : previousValue;
        const title = "Open Position Trend";
        const description = "open Position trend";
        return {
          id: WidgetTypeEnum.OPEN_POSITIONS_TREND,
          percentRatio: ((currentValue - previousValue) / coefficient) * 100,
          total: data.total,
          chartData: data.values.map((item: number, index: number) => ({ x: index, y: item })),
          title: title,
          description: description
        };
      })
    );
  }

  private getInProgressPositionTrendWidgetData(filter: DashboartFilterDto): Observable<PositionTrend> {
    return this.httpClient.post<PositionTrendDto>(`${this.baseUrl}/getinprogresstrend`, { ...filter }).pipe(
      map((data: PositionTrendDto) => {
        const [previousValue, currentValue] = data.values.slice(-2);
        const coefficient = previousValue === 0 ? 1 : previousValue;
        const title = "In Progress Position Trend";
        const description = "In  Progress Position trend";
        return {
          id: WidgetTypeEnum.IN_PROGRESS_POSITIONS_TREND,
          percentRatio: ((currentValue - previousValue) / coefficient) * 100,
          total: data.total,
          chartData: data.values.map((item: number, index: number) => ({ x: index, y: item })),
          title: title,
          description: description
        };
      })
    );
  }

  private getInvocesWidgetData(): Observable<any> {
    return of('temporary-widget-invoices');
  }

  public getAllSkills(): Observable<AllOrganizationsSkill[]> {
    return this.httpClient.get<AllOrganizationsSkill[]>(`/api/AssignedSkills/forOrganizations`).pipe(map((data) => sortByField(data, 'skillDescription')));
  }

  public getOrganizationSkills(businessUnitId?: number): Observable<AssignedSkillsByOrganization[]> {
    const headers = businessUnitId ? new HttpHeaders({ 'selected-businessunit-id': `${businessUnitId}` }) : {};
    return this.httpClient
      .get<AssignedSkillsByOrganization[]>('/api/AssignedSkills/assignedSkillsForCurrentBusinessUnit', { headers })
      .pipe(map((data) => sortByField(data, 'skillDescription')));
  }

  private getCandidateAppliedInLastNDays(filter: DashboartFilterDto, orderStatus: ApplicantStatus): Observable<CandidateStatusDataModel> {
    return this.httpClient
      .post<CandidateStatusDataModel>(`${this.baseUrl}/CandidateAppliedInLastNDays`, { orderStatuses: [orderStatus], ...filter })
      .pipe(map(data=>data

      )
      );
  }

  public getAllMasterCommitments(): Observable<GetWorkCommitment[]> {
    return this.httpClient.get<GetWorkCommitment[]>(`${this.baseUrl}/GetAllWorkcommitment`, { });
  }
  public getSkills(): Observable<GetWorkCommitment[]> {
    return this.httpClient.get<GetWorkCommitment[]>(`${this.baseUrl}/GetAllNursingSkills`);
  }

  public filterNursingWidget(data : GetNursingUtilizationbyByFilters): Observable<GetNursingWidgetData> {
    return this.httpClient.post<GetNursingWidgetData>(`${this.baseUrl}/get-nursing-utilization-by-filters`, data);
  }
}
