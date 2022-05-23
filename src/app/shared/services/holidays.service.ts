import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { Holiday, HolidaysPage, OrganizationHoliday, OrganizationHolidaysPage } from '@shared/models/holiday.model';

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
   * Get holidays by page number
   * @param pageNumber
   * @param pageSize
   * @return list of holidays
   */
  public getOrganizationHolidays(pageNumber: number, pageSize: number, filter: { year: number }): Observable<OrganizationHolidaysPage> {
    let params;
    let url;
    if (filter.year) {
      params = { params: { PageNumber: pageNumber, PageSize: pageSize, Year: filter.year } };
      url = '/api/OrganizationHolidays/filter'; // TODO: pending BE
    } else {
      params = { params: { PageNumber: pageNumber, PageSize: pageSize } };
      url = '/api/OrganizationHolidays';
    }
    return this.http.get<OrganizationHolidaysPage>(url, params);
  }

  /**
   * Remove holiday by its id
   * @param holiday
   */
  public removeOrganizationHoliday(holiday: OrganizationHoliday): Observable<any> {
    return this.http.delete<any>(`/api/OrganizationHolidays/${holiday.id}`);
  }
}
