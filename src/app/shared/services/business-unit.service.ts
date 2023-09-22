import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { BusinessUnit } from '@shared/models/business-unit.model';
import { sortByField } from '@shared/helpers/sort-by-field.helper';
import { GetBusinessUnitIdDetails } from '@shared/models/user-managment-page.model';

@Injectable({
  providedIn: 'root'
})
export class BusinessUnitService {

  constructor(private http: HttpClient) { }

  /**
   * Get the list of available business by unit type
   * @return Array of business
   */
  public getBusinessByUnitType(type: BusinessUnitType,isUsers:boolean=false): Observable<BusinessUnit[]> {
    return this.http.get<BusinessUnit[]>(`/api/BusinessUnit/businessUnitType/${type}/${isUsers}`).pipe(map((data) => sortByField(data, 'name')));
  }
   /**
   * Get the list of available business by unit type
   * @return Array of business
   */
    public getBusinessUnits(): Observable<BusinessUnit[]> {
      return this.http.get<BusinessUnit[]>(`/api/BusinessUnit/basicInfo`);
    }

    /**
   * Get the list of available business for employee type
   * @return Array of business
   */
     public getBusinessForEmployeeType(): Observable<BusinessUnit[]> {
      return this.http.get<BusinessUnit[]>(`/api/BusinessUnit/getBusinessForEmployeeType`);
    }

    public getBusinessIdDetails(id: number): Observable<GetBusinessUnitIdDetails> {
      return this.http.get<GetBusinessUnitIdDetails>(`/api/BusinessUnit/businessUnitID/${id}`);
    }
}
