import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { Shift, ShiftsPage } from 'src/app/shared/models/shift.model';

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
  public getShifts(pageNumber: number, pageSize: number, organizationId: number): Observable<ShiftsPage> {
    return this.http.post<ShiftsPage>(`/api/MasterShifts/filter`, { organizationId: organizationId, pageNumber: pageNumber, pageSize: pageSize });
  }

  /**
   * Remove shift by its id
   * @param shift
   */
  public removeShift(shift: Shift): Observable<any> {
    return this.http.delete<any>(`/api/MasterShifts/${shift.id}`);
  }
}
