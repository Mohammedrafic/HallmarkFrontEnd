import { Injectable } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { OrderTab } from '@shared/components/candidate-details/models/candidate.model';

@Injectable({
  providedIn: 'root',
})
export class OrderManagementAgencyService extends DestroyableDirective {
  public orderPerDiemId$: Subject<number> = new Subject<number>();
  public selectedOrderAfterRedirect$: Subject<OrderTab> = new Subject<OrderTab>();
  public orderId$: Subject<number> = new Subject<number>();
  public excludeDeployed: boolean;

  private _orderPerDiemId: number | null;
  private _selectedOrderAfterRedirect: OrderTab | null;

  constructor() {
    super();
    this.orderPerDiemId$.pipe(takeUntil(this.destroy$)).subscribe((id: number) => (this.orderPerDiemId = id));
    this.selectedOrderAfterRedirect$
      .pipe(takeUntil(this.destroy$))
      .subscribe((order: OrderTab) => (this.selectedOrderAfterRedirect = order));
  }

  set orderPerDiemId(value: number | null) {
    this._orderPerDiemId = value;
  }

  get orderPerDiemId(): number | null {
    return this._orderPerDiemId;
  }

  set selectedOrderAfterRedirect(value: OrderTab | null) {
    this._selectedOrderAfterRedirect = value;
  }

  get selectedOrderAfterRedirect(): OrderTab | null {
    return this._selectedOrderAfterRedirect;
  }
}
