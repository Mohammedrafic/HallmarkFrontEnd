import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OrderManagementService {
  public readonly orderPerDiemId$: Subject<number> = new Subject<number>();
  public readonly orderId$: Subject<number | null> = new Subject<number | null>();
  public excludeDeployed: boolean;
}
