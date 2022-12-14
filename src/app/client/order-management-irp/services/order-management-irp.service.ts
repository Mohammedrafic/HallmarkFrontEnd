import { Injectable } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { OrderTab } from '@shared/components/candidate-details/models/candidate.model';
import { Destroyable } from '@core/helpers';
import { FormBuilder } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class OrderManagementIrpService extends Destroyable {
  public readonly orderPerDiemId$: Subject<{ id: number; prefix: string }> = new Subject<{
    id: number;
    prefix: string;
  }>();
  public readonly orderId$: Subject<{ id: number; prefix: string } | null> = new Subject<{
    id: number;
    prefix: string;
  } | null>();
  public readonly reorderId$: Subject<{ id: number; prefix: string } | null> = new Subject<{
    id: number;
    prefix: string;
  } | null>();
  public readonly selectedTab$: Subject<number> = new Subject<number>();
  public selectedOrderAfterRedirect$: Subject<OrderTab> = new Subject<OrderTab>();
  public excludeDeployed: boolean;

  private _selectedOrderAfterRedirect: OrderTab | null;

  constructor() {
    super();

    this.selectedOrderAfterRedirect$.pipe(
      takeUntil(this.componentDestroy()),
    ).subscribe((order: OrderTab) => {
      this.selectedOrderAfterRedirect = order;
    });
  }

  set selectedOrderAfterRedirect(value: OrderTab | null) {
    this._selectedOrderAfterRedirect = value;
  }

  get selectedOrderAfterRedirect(): OrderTab | null {
    return this._selectedOrderAfterRedirect;
  }
}
