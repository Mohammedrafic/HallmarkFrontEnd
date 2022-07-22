import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { map, Observable, of } from 'rxjs';

import { CapitalizeFirstPipe } from '@shared/pipes/capitalize-first/capitalize-first.pipe';
import {
  TimesheetsFilterState,
  TimesheetRecord,
  TabCountConfig,
  TimesheetRecordsDto,
  DropdownOption,
  CandidateHoursAndMilesData,
  RecordValue,
  CostCentersDto,
} from '../interface';
import { BillRate } from '@shared/models/bill-rate.model';
import {
  DataSourceItem,
  FilterDataSource,
} from '../interface';
import { TimeSheetsPage } from '../store/model/timesheets.model';
import {
  filterColumnDataSource,
  MokTabsCounts,
  MockCandidateHoursAndMilesData,
} from '../constants';
import { TimesheetsTableFiltersColumns } from '../enums';
import { CostCenterAdapter } from '../helpers';

@Injectable()
export class TimesheetsApiService {

  constructor(
    private http: HttpClient,
    private capitalizeFirst: CapitalizeFirstPipe,
  ) {}

  public getTimesheets(filters: TimesheetsFilterState): Observable<TimeSheetsPage> {
    return this.http.post<TimeSheetsPage>('/api/Timesheets', {
      ...filters,
    });
  }

  public getTabsCounts(): Observable<TabCountConfig> {
    return of(MokTabsCounts);
  }

  public getTimesheetRecords(
    id: number,
    orgId: number,
    isAgency: boolean,
    ): Observable<TimesheetRecordsDto> {
    const endpoint = !isAgency
    ? `/api/Timesheets/${id}/records` : `/api/Timesheets/${id}/records/organization/${orgId}`;
    return this.http.get<TimesheetRecordsDto>(endpoint)
    .pipe(
      map((data) => {
        data.timesheets.forEach((item: RecordValue) => {
          item.day = item['timeIn'] as string
          item.costCenter = 69;
        });
        data.miles.forEach((item: RecordValue) => {
          item.day = item['timeIn'] as string;
          item.costCenter = 69;
        });
        return data;
      })
    );
  }

  public AddTimesheetRecord(timesheetId: number, body: TimesheetRecord): Observable<null> {
    return this.http.post<null>(`/api/Timesheets/${timesheetId}/records`, body);
  }

  public patchTimesheetRecords(
    id: number,
    records: Record<string, string | number>[],
  ): Observable<null> {
    return of(null);
  }

  public deleteProfileTimesheets(profileId: number, profileTimesheetId: number): Observable<null> {
    return of(null);
  }

  /**
   * TODO: move this to helpers
   */
  public setDataSources(filterKeys: TimesheetsTableFiltersColumns[]): Observable<FilterDataSource> {
    const res = filterKeys.reduce((acc: any, key) => {
      acc[key] = filterColumnDataSource[key].map((el: DataSourceItem) =>
        ({...el, name: this.capitalizeFirst.transform(el.name)})
      );

      return acc;
    }, {});

    return of(res);
  }

  public getCandidateCostCenters(jobId: number, orgId: number, isAgency: boolean): Observable<DropdownOption[]>{
    const endpoint = isAgency ?
    `/api/Jobs/${jobId}/costcenters/${orgId}` : `/api/Jobs/${jobId}/costcenters`;

    return this.http.get<CostCentersDto>(endpoint)
    .pipe(
      map((res) => CostCenterAdapter(res)),
    );
  }

  public getOrganizations(): Observable<DataSourceItem[]> {
    return this.http.get<DataSourceItem[]>(`/api/Agency/partneredorganizations`);
  }

  public getCandidateBillRates(
    jobId: number,
    orgId: number,
    isAgency: boolean,
    ): Observable<DropdownOption[]> {
    const endpoint = isAgency ?
    `/api/Jobs/${jobId}/billrates/${orgId}` : `/api/Jobs/${jobId}/billrates`;
    return this.http.get<BillRate[]>(endpoint)
    .pipe(
      map((res) => res.map((item) => {
        return {
          text: item.billRateConfig.title,
          value: item.billRateConfig.id,
        }
      })),
    );
  }
}
