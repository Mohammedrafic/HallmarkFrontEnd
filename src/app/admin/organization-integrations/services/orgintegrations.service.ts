import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import lodashMap from 'lodash/fp/map';
import lodashMapPlain from 'lodash/map';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { ChartAccumulation } from '../../../dashboard/models/chart-accumulation-widget.model';
import { IntegrationFilterDto } from '../../../shared/models/integrations.model';
import { IntegrationMonthReportModel } from '../models/IntegrationMonthReportModel';
 

@Injectable({
  providedIn: 'root'
})
export class OrgintegrationsService {
  private readonly baseUrl = '/api/Integrations';
  integrationsRunsLast12Months$: BehaviorSubject<IntegrationMonthReportModel[]> = new BehaviorSubject<IntegrationMonthReportModel[]>([]);
  constructor(private readonly httpClient: HttpClient, private readonly router: Router, private readonly store: Store) { }

  public getMonthlyIntegrationRuns(filter: IntegrationFilterDto): Observable<ChartAccumulation> {
     
    return this.httpClient.post<IntegrationMonthReportModel[]>(`${this.baseUrl}/getMonthlyIntegrationRuns`, { ...filter }).pipe(
      map((candidatesInfo: IntegrationMonthReportModel[]) => {
        this.integrationsRunsLast12Months$.next(candidatesInfo);
        return {
          id: "",
          title: 'Integration Runs last 12 Months',
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
}
 
