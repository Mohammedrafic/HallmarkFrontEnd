import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { Shift, ShiftsPage } from 'src/app/shared/models/shift.model';
import { ExportPayload } from '@shared/models/export.model';
import { ScheduleShift } from '@shared/models/schedule-shift.model';

@Injectable({ providedIn: 'root' })
export class ShiftsService {

  constructor(private http: HttpClient) { }

  /**
   * Create or update shift record
   * @param shift object to save
   * @return Created/Updated shift
   */
  public saveUpdateShift(shift: Shift): Observable<Shift> {
    return shift.id ?
      this.http.put<Shift>(`/api/MasterShifts`, shift) :
      this.http.post<Shift>(`/api/MasterShifts/create`, shift);
  }

  /**
   * Get shifts by page number
   * @param pageNumber
   * @param pageSize
   * @return list of shifts
   */
  public getShifts(pageNumber: number, pageSize: number): Observable<ShiftsPage> {
    return this.http.post<ShiftsPage>(`/api/MasterShifts/filter`, { pageNumber: pageNumber, pageSize: pageSize });
  }

  /**
   * Remove shift by its id
   * @param shift
   */
  public removeShift(shift: Shift): Observable<any> {
    return this.http.delete<any>(`/api/MasterShifts/${shift.id}`);
  }

  /**
   * Export shifts
   */
  public export(payload: ExportPayload): Observable<any> {
    if (payload.ids) {
      return this.http.post(`/api/MasterShifts/export/byIds`, payload, { responseType: 'blob' });
    }
    return this.http.post(`/api/MasterShifts/export`, payload, { responseType: 'blob' });
  }

  public getAllShifts(): Observable<ScheduleShift[]> {
    return this.http.get<ScheduleShift[]>(`/api/MasterShifts/all`);
  }
}
