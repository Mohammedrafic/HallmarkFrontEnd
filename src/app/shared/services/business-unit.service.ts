import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { BusinessUnit } from '@shared/models/business-unit.model';

@Injectable({
  providedIn: 'root'
})
export class BusinessUnitService {

  constructor(private http: HttpClient) { }

  /**
   * Get the list of available business by unit type
   * @return Array of business
   */
  public getBusinessByUnitType(type: BusinessUnitType): Observable<BusinessUnit[]> {
    return this.http.get<BusinessUnit[]>(`/api/BusinessUnit/businessUnitType/${type}`);
  }
}
