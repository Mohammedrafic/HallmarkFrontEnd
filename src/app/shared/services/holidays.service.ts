import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { map, Observable } from 'rxjs';
import {
  Holiday,
  HolidayFilters,
  HolidaysPage,
  OrganizationHoliday,
  OrganizationHolidaysPage,
} from '@shared/models/holiday.model';
import { ExportPayload } from '@shared/models/export.model';
import { sortBy } from '@shared/helpers/sort-array.helper';

@Injectable({ providedIn: 'root' })
export class HolidaysService {

  constructor(private http: HttpClient) { }

  /**
   * Create or update holiday record
   * @param holiday object to save
   * @return Created/Updated holiday
   */
  public saveUpdateHoliday(holiday: Holiday): Observable<Holiday> {
    return holiday.id ?
      this.http.put<Holiday>(`/api/MasterHolidays`, holiday) :
      this.http.post<Holiday>(`/api/MasterHolidays`, holiday);
  }

  /**
   * Get holidays by page number
   * @param pageNumber
   * @param pageSize
   * @return list of holidays
   */
  public getHolidays(pageNumber: number, pageSize: number, filter: { year: number }): Observable<HolidaysPage> {
    let params;
    let url;
    if (filter.year) {
      params = { params: { PageNumber: pageNumber, PageSize: pageSize, Year: filter.year } };
      url = '/api/MasterHolidays/filter';
    } else {
      params = { params: { PageNumber: pageNumber, PageSize: pageSize } };
      url = '/api/MasterHolidays';
    }
    return this.http.get<HolidaysPage>(url, params);
  }

    /**
   * Get all master holidays
   * @return list of holidays
   */
     public getAllMasterHolidays(): Observable<Holiday[]> {
      return this.http.get<Holiday[]>('/api/MasterHolidays/all');
    }

  /**
   * Remove holiday by its id
   * @param holiday
   */
  public removeHoliday(holiday: Holiday): Observable<any> {
    return this.http.delete<any>(`/api/MasterHolidays/${holiday.id}`);
  }

  /**
   * Create or update holiday record
   * @param holiday object to save
   * @return Created/Updated holiday
   */
  public saveUpdateOrganizationHoliday(holiday: OrganizationHoliday): Observable<OrganizationHoliday> {
    return holiday.id ?
      this.http.put<OrganizationHoliday>(`/api/OrganizationHolidays`, holiday) :
      this.http.post<OrganizationHoliday>(`/api/OrganizationHolidays`, holiday);
  }

  /**
   * Edit holiday record
   * @param holiday object to save
   * @return Updated holiday
   */
  public editOrganizationHoliday(holiday: OrganizationHoliday): Observable<OrganizationHoliday> {
    return this.http.put<OrganizationHoliday>(`/api/OrganizationHolidays`, holiday);
  }

  /**
   * Get holidays by page number
   * @param pageNumber
   * @param pageSize
   * @return list of holidays
   */
  public getOrganizationHolidays(pageNumber: number, pageSize: number, orderBy: string, filters: HolidayFilters): Observable<OrganizationHolidaysPage> {
    let params;
    if (Object.keys(filters).length) {
      filters.pageNumber = pageNumber;
      filters.pageSize = pageSize;
      filters.orderBy = orderBy;
      return this.http.post<OrganizationHolidaysPage>('/api/OrganizationHolidays/filter', filters);
    } else {
      params = { params: { PageNumber: pageNumber, PageSize: pageSize, OrderBy: orderBy } };
      return this.http.get<OrganizationHolidaysPage>('/api/OrganizationHolidays', params);
    }
  }

  /**
   * Checks if overriding to be performed
   * @param holiday
   * @returns boolean
   */
  public checkIfExist(holiday: OrganizationHoliday): Observable<boolean> {
    return this.http.post<boolean>(`/api/OrganizationHolidays/isExist`, holiday);
  }

  /**
   * Remove holiday by its id
   * @param holiday
   */
  public removeOrganizationHoliday(holiday: OrganizationHoliday): Observable<any> {
    return this.http.delete<any>(`/api/OrganizationHolidays`, {
      body: { masterHolidayId: holiday.masterHolidayId || 0, orgHolidayId: holiday.id || 0 }
    });
  }

  /**
   * Export holidays
   */
  public export(payload: ExportPayload): Observable<any> {
    if (payload.ids) {
      return this.http.post(`/api/MasterHolidays/export/byIds`, payload, { responseType: 'blob' });
    }
    return this.http.post(`/api/MasterHolidays/export`, payload, { responseType: 'blob' });
  }

  /**
   * Export org holidays
   */
  public exportOrganizationHolidays(payload: ExportPayload): Observable<any> {
    if (payload.ids) {
      return this.http.post(`/api/OrganizationHolidays/export/byIds`, payload, { responseType: 'blob' });
    }
    return this.http.post(`/api/OrganizationHolidays/export`, payload, { responseType: 'blob' });
  }

  /**
   * Get the list of all available holiday names
   * @return list of names
   */
  public getHolidaysDataSources(): Observable<string[]> {
    return this.http.get<string[]>(`/api/OrganizationHolidays/availiableNames`).pipe(map((data) => sortBy(data)));
  }
}
