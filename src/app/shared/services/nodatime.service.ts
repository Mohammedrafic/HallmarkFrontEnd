import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TimeZoneModel } from '../../shared/models/location.model';


@Injectable({
  providedIn: 'root'
})
export class NodatimeService {

  constructor(private http: HttpClient) { }
  /**
   * Get usa canada timezoneids from noda
   * @return Array of timezoneIds
   */
   public getUSCanadaTimeZoneIds(): Observable<TimeZoneModel[]> {
    return this.http.get<TimeZoneModel[]>(`/api/NodaTime/uscanadatimezones`);
  }
}

