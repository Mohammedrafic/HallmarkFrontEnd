import { Injectable } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { OrderTab } from '@shared/components/candidate-details/models/candidate.model';

@Injectable({
  providedIn: 'root',
})
export class OrderManagementService extends DestroyableDirective {
  public readonly orderPerDiemId$: Subject<{id: number, prefix: string}> = new Subject<{id: number, prefix: string}>();
  public readonly orderId$: Subject<{id: number, prefix: string} | null> = new Subject<{id: number, prefix: string} | null>();
  public selectedOrderAfterRedirect$: Subject<OrderTab> = new Subject<OrderTab>();
  public excludeDeployed: boolean;

  private _selectedOrderAfterRedirect: OrderTab | null;

  constructor() {
    super();
    this.selectedOrderAfterRedirect$
      .pipe(takeUntil(this.destroy$))
      .subscribe((order: OrderTab) => (this.selectedOrderAfterRedirect = order));
  }

  set selectedOrderAfterRedirect(value: OrderTab | null) {
    this._selectedOrderAfterRedirect = value;
  }

  get selectedOrderAfterRedirect(): OrderTab | null {
    return this._selectedOrderAfterRedirect;
  }
}
