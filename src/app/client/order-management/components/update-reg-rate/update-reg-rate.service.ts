import { Injectable } from '@angular/core';
import { UpdateRegrateModel } from '@shared/models/update-regrate.model';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class UpdateRegRateService {
  constructor(private http: HttpClient) {}

  public UpdateRegRate(getregrate : UpdateRegrateModel): Observable<any> {
    return this.http.put('/api/Orders/updateBulkHourlyRate', getregrate);
  }

}
