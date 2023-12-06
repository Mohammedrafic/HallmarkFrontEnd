import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import lodashMap from 'lodash/fp/map';
import lodashMapPlain from 'lodash/map';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { CandidateTypeInfoModel } from '../../../dashboard/models/candidate-type-info.model';
import { ChartAccumulation } from '../../../dashboard/models/chart-accumulation-widget.model';
import { IntegrationFilterDto } from '../../../shared/models/integrations.model';
 

@Injectable({
  providedIn: 'root'
})
export class OrgintegrationsService {
  private readonly baseUrl = '/api/Integrations';
  integrationsRunsLast12Months$: BehaviorSubject<CandidateTypeInfoModel[]> = new BehaviorSubject<CandidateTypeInfoModel[]>([]);
  constructor(private readonly httpClient: HttpClient, private readonly router: Router, private readonly store: Store) { }

  public getMonthlyIntegrationRuns(filter: IntegrationFilterDto): Observable<ChartAccumulation> {
    debugger;
    return this.httpClient.post<CandidateTypeInfoModel[]>(`${this.baseUrl}/getMonthlyIntegrationRuns`, { ...filter }).pipe(
      map((candidatesInfo: CandidateTypeInfoModel[]) => {
        this.integrationsRunsLast12Months$.next(candidatesInfo);
        return {
          id: "",
          title: 'Integration Runs last 12 Months',
          chartData: lodashMapPlain(candidatesInfo, ({ count, status }: CandidateTypeInfoModel, index: number) => ({
            label: status,
            value: count,
            text: '',
            color: 'blue'
          })),
        };
      })
    );
  }
}
 
