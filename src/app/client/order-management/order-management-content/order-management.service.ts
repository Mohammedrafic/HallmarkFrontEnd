import { Injectable } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { OrderTab } from '@shared/components/candidate-details/models/candidate.model';

@Injectable({
  providedIn: 'root',
})
export class OrderManagementService extends DestroyableDirective {
  public readonly orderPerDiemId$: Subject<number> = new Subject<number>();
  public readonly orderId$: Subject<number | null> = new Subject<number | null>();
  public orderAllOrdersId$: Subject<OrderTab> = new Subject<OrderTab>();
  public excludeDeployed: boolean;

  private _orderAllOrdersId: OrderTab | null;

  constructor() {
    super();
    this.orderAllOrdersId$
      .pipe(takeUntil(this.destroy$))
      .subscribe((order: OrderTab) => (this.orderAllOrdersId = order));
  }

  set orderAllOrdersId(value: OrderTab | null) {
    this._orderAllOrdersId = value;
  }

  get orderAllOrdersId(): OrderTab | null {
    return this._orderAllOrdersId;
  }
}
