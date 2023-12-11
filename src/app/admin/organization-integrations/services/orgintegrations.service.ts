import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import lodashMap from 'lodash/fp/map';
import lodashMapPlain from 'lodash/map';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { ChartAccumulation } from '../../../dashboard/models/chart-accumulation-widget.model';
import { IntegrationFilterDto, IntegraionFailFilterDto } from '../../../shared/models/integrations.model';
import { IntegrationMonthReportModel, NewInterfaceListModel, NewInterfaceListdata } from '../models/IntegrationMonthReportModel';
import { RecentRunsListModel } from '../models/RecentRunsListModel';
@Injectable({
  providedIn: 'root'
})
export class OrgintegrationsService {
  private readonly baseUrl = '/api/Integrations';
  integrationsRunsLast12Months$: BehaviorSubject<IntegrationMonthReportModel[]> = new BehaviorSubject<IntegrationMonthReportModel[]>([]);
  integrationsmonthlyFailureLast12Months$: BehaviorSubject<IntegrationMonthReportModel[]> = new BehaviorSubject<IntegrationMonthReportModel[]>([]);
  NewInterfaceListdata$: BehaviorSubject<NewInterfaceListModel[]> = new BehaviorSubject<NewInterfaceListModel[]>([]);
  constructor(private readonly httpClient: HttpClient, private readonly router: Router, private readonly store: Store) { }

  public getMonthlyIntegrationRuns(filter: IntegrationFilterDto): Observable<ChartAccumulation> {
     
    return this.httpClient.post<IntegrationMonthReportModel[]>(`${this.baseUrl}/getMonthlyIntegrationRuns`, { ...filter }).pipe(
      map((candidatesInfo: IntegrationMonthReportModel[]) => {
        this.integrationsRunsLast12Months$.next(candidatesInfo);
        return {
          id: "",
          title: 'Integration Runs By Month',
          chartData: lodashMapPlain(candidatesInfo, ({ monthlyIntegrationRunsCount, monthName }: IntegrationMonthReportModel, index: number) => ({
            label: monthName,
            value: monthlyIntegrationRunsCount,
            text: monthName,
            color: 'blue'
          })),
        };
      })
    );
  }

  public getMonthlyIntegrationRunFailure(filter: IntegraionFailFilterDto): Observable<ChartAccumulation> {
    return this.httpClient.post<IntegrationMonthReportModel[]>(`${this.baseUrl}/getMonthlyFailureIntegrationRuns`, { ...filter }).pipe(
      map((candidatesInfo: IntegrationMonthReportModel[]) => {
        this.integrationsmonthlyFailureLast12Months$.next(candidatesInfo);
        return {
          id: "",
          title: 'Integration Runs last 12 Months with failure',
          chartData: lodashMapPlain(candidatesInfo, ({ monthlyIntegrationRunsCount, monthName }: IntegrationMonthReportModel, index: number) => ({
            label: monthName,
            value: monthlyIntegrationRunsCount,
            text: monthName,
            color: 'Red'
          })),
        };
      })
    );
  }

  public getLatestInterfaceList(filter: IntegrationFilterDto): Observable<NewInterfaceListdata> {
     
    return this.httpClient.post<NewInterfaceListModel[]>(`${this.baseUrl}/getNewInterfacesList`, { ...filter }).pipe(
      map((InterfaceListInfo: NewInterfaceListModel[]) => {
        this.NewInterfaceListdata$.next(InterfaceListInfo);
        return {
          id: "",
          title: 'New Interface List',
          interfacedata: lodashMapPlain(InterfaceListInfo, ({ organizationId,organizationName,interfaceName,integrationType,interfaceId }: NewInterfaceListModel, index: number) => ({
            interfaceId: interfaceId,
            interfaceName: interfaceName,
            organizationId: organizationId,
            organizationName: organizationName,
            integrationType:integrationType
          })),
        };
      })
    );

  }

  public getRecentRunsList(filter: IntegrationFilterDto): Observable<RecentRunsListModel[]> {
    return this.httpClient.post<RecentRunsListModel[]>(`${this.baseUrl}/getRecentRunsList`, { ...filter }).pipe(
      map((data) => data))
  }
}
 
