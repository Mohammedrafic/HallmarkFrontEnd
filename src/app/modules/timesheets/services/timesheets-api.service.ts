import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { catchError, map, Observable, of } from 'rxjs';

import { BillRate } from '@shared/models/bill-rate.model';
import { DataSourceItem, DropdownOption } from '@core/interface';

import {
  TimesheetsFilterState, TimesheetRecordsDto, CostCentersDto,
  AddRecordDto, PutRecordDto, TimesheetsFilteringOptions, TabCountConfig, RawTimesheetRecordsDto, AddRecordBillRate,
} from '../interface';
import { CostCenterAdapter, RecordsAdapter } from '../helpers';
import { TimeSheetsPage } from '../store/model/timesheets.model';
import { sortByField } from '@shared/helpers/sort-by-field.helper';
import { ExportPayload } from '@shared/models/export.model';

@Injectable()
export class TimesheetsApiService {

  constructor(
    private http: HttpClient,
  ) {}

  public getTimesheets(filters: TimesheetsFilterState): Observable<TimeSheetsPage> {
    const mappedFilters = this.mapTimeSheetsFilters(filters);
    return this.http.post<TimeSheetsPage>('/api/Timesheets', {
      ...mappedFilters,
    });
  }

  public getTabsCounts(filters: TimesheetsFilterState): Observable<TabCountConfig> {
    const mappedFilters = this.mapTimeSheetsFilters(filters);
    return this.http.post<TabCountConfig>('/api/Timesheets/tabcounters', {
      ...mappedFilters,
    });
  }

  public getTimesheetRecords(
    id: number,
    orgId: number,
    isAgency: boolean,
    ): Observable<TimesheetRecordsDto> {
    const endpoint = !isAgency
    ? `/api/Timesheets/${id}/records` : `/api/Timesheets/${id}/records/organization/${orgId}`;
    return this.http.get<RawTimesheetRecordsDto>(endpoint)
    .pipe(
      map((data) => RecordsAdapter.adaptRecordsDto(data)),
      catchError(() => of({
        timesheets: {
          editMode: [],
          viewMode: [],
        },
        historicalData: {
          editMode: [],
          viewMode: [],
        },
        miles: {
          editMode: [],
          viewMode: [],
        },
        expenses: {
          editMode: [],
          viewMode: [],
        },
      }))
    );
  }

  public postBulkApprove(timesheetIds: number[]): Observable<void> {
    return this.http.post<void>('/api/TimesheetState/bulkapprove', { timesheetIds });
  }

  public addTimesheetRecord(body: AddRecordDto): Observable<void> {
    return this.http.post<void>(`/api/Timesheets/${body.timesheetId}/records`, body);
  }

  public putTimesheetRecords(
    dto: PutRecordDto,
  ): Observable<void> {
    return this.http.put<void>(`/api/Timesheets/${dto.timesheetId}/records`, dto);
  }

  public getFiltersDataSource(
    organizationId: number | null = null
  ): Observable<TimesheetsFilteringOptions> {
    return this.http.get<TimesheetsFilteringOptions>(
      `/api/Timesheets/filteringOptions${organizationId ? `/${organizationId}` : ''}`).pipe( map((data) => {
        return Object.fromEntries(Object.entries(data).map(([key, value]) => [[key], sortByField(value, 'name')]));
      })
    );
  }

  public getCandidateCostCenters(jobId: number, orgId: number, isAgency: boolean): Observable<DropdownOption[]>{
    const endpoint = isAgency ?
    `/api/Jobs/${jobId}/costcenters/${orgId}` : `/api/Jobs/${jobId}/costcenters`;

    return this.http.get<CostCentersDto>(endpoint)
    .pipe(
      map((res) => sortByField(CostCenterAdapter(res), 'text')),
    );
  }

  public getOrganizations(): Observable<DataSourceItem[]> {
    return this.http.get<DataSourceItem[]>(`/api/Agency/partneredorganizations`);
  }

  public getCandidateBillRates(
    jobId: number,
    orgId: number,
    isAgency: boolean,
    ): Observable<AddRecordBillRate[]> {
    const endpoint = isAgency ?
    `/api/Jobs/${jobId}/billrates/${orgId}` : `/api/Jobs/${jobId}/billrates`;
    return this.http.get<BillRate[]>(endpoint)
    .pipe(
      map((res) => res.map((item) => {
        return {
          text: item.billRateConfig.title,
          value: item.billRateConfig.id,
          efectiveDate: item.effectiveDate,
          disableMealBreak: item.billRateConfig.disableMealBreak,
          timeNotRequired: item.billRateConfig.doNotRequireTime,
          disableTime: item.billRateConfig.disableTime,
        };
      })),
    );
  }

  public uploadMilesAttachments(
    timesheetRecordId: number | null,
    formData: FormData,
    organizationId: number | null = null,
  ): Observable<void> {
    if(organizationId) {
      return this.http.post<void>(`/api/TimesheetRecords/${timesheetRecordId}/organizations/${organizationId}/files`,
      formData);
    }
    return this.http.post<void>(`/api/TimesheetRecords/${timesheetRecordId}/files`, formData);
  }

  public deleteMilesAttachment(
    timesheetRecordId: number | null,
    fileId: number,
    organizationId: number | null = null,
  ): Observable<void> {
    if(organizationId) {
      return this.http.delete<void>(
        `/api/TimesheetRecords/${timesheetRecordId}/organizations/${organizationId}/files/${fileId}`);
    }
    return this.http.delete<void>(`/api/TimesheetRecords/${timesheetRecordId}/files/${fileId}`);
  }
  public exportTimeSheets(payload: ExportPayload): Observable<Blob> {
    const url =  '/api/Timesheets/exporttimesheets';
    return this.http.post(url, payload, { responseType: 'blob' });
  }

  private mapTimeSheetsFilters(filters: TimesheetsFilterState): TimesheetsFilterState {
    return {
      ...filters, 
      orderIds: filters.orderIds && !Array.isArray(filters.orderIds) ? [filters.orderIds as string] : filters.orderIds,
    };
  }
}
