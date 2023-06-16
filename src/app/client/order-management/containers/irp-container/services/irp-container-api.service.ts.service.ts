import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class IrpContainerApiService {
  constructor(
    private http: HttpClient,
  ) { }

  public checkLinkedSchedules(orderId: number): Observable<{ doesOrderHaveLinkedSchedules: boolean }> {
    return this.http.get<{ doesOrderHaveLinkedSchedules: boolean }>(`/api/orders/linkedSchedulesCheck/${orderId}`);
  }
}
