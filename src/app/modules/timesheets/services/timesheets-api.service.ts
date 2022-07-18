import { BillRate } from '@shared/models/bill-rate.model';
import { tap } from 'rxjs/internal/operators/tap';
import { RecordValue, CostCentersDto, CostCenter } from './../interface/common.interface';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { map, Observable, of } from 'rxjs';
import { CapitalizeFirstPipe } from '@shared/pipes/capitalize-first/capitalize-first.pipe';

import {
  TimesheetsFilterState,
  TimesheetRecord,
  CandidateInfo,
  TimesheetAttachments,
  TabCountConfig,
  TimesheetRecordsDto,
  DropdownOption,
} from '../interface';
import { BillRatesOptions } from './../constants/timesheet-records-mock.constant';
import {
  DataSourceItem,
  FilterDataSource,
} from '../interface';
import { TimeSheetsPage } from '../store/model/timesheets.model';
import {
  filterColumnDataSource,
  MokTabsCounts,
  MockCandidateHoursAndMilesData,
  MokTimesheet,
  MokTimesheet1,
} from '../constants';
import {
  CandidateMockInfo,
  CostCenterOptions,
} from '../constants/timesheet-records-mock.constant';
import { TimesheetsTableColumns } from '../enums';
import { CandidateHoursAndMilesData } from '../interface';
import { CostCenterAdapter } from '../helpers/cost-centers.adapter';

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

  public getTimesheetRecords(id: number): Observable<TimesheetRecordsDto> {
    return this.http.get<TimesheetRecordsDto>(`/api/Timesheets/${id}/records`)
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

  public postProfileTimesheets(body: TimesheetRecord): Observable<null> {
    return of(null);
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

  public deleteTimesheet(id: number): Observable<boolean> {
    return of(true);
  }

  public setDataSources(filterKeys: TimesheetsTableColumns[]): Observable<FilterDataSource> {
    const res = filterKeys.reduce((acc: any, key) => {
      acc[key] = filterColumnDataSource[key].map((el: DataSourceItem) =>
        ({...el, name: this.capitalizeFirst.transform(el.name)})
      );

      return acc;
    }, {});

    return of(res);
  }

  public getCandidateInfo(id: number): Observable<CandidateInfo> {
    return of(CandidateMockInfo);
  }

  public getCandidateHoursAndMilesData(id: number): Observable<CandidateHoursAndMilesData> {
    return of(MockCandidateHoursAndMilesData);
  }

  public getCandidateAttachments(id: number): Observable<TimesheetAttachments> {
    return of();
  }

  public getCandidateCostCenters(jobId: number): Observable<DropdownOption[]>{
    return this.http.get<CostCentersDto>(`/api/Jobs/${jobId}/costcenters`)
    .pipe(
      map((res) => CostCenterAdapter(res)),
    );
  }

  public getCandidateBillRates(
    depId: number,
    skillId: number,
    orderType: number,
    ): Observable<DropdownOption[]> {
    // return this.http.get<BillRate[]>(`/api/BillRates/predefined/forOrder`, {
    //   params: {
    //     DepartmentId: depId,
    //     SkillId: skillId,
    //     OrderType: orderType,
    //   }
    // })
    return of(BillRatesOptions)
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
