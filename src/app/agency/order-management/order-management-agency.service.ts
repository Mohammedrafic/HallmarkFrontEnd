import { Injectable } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';

@Injectable({
  providedIn: 'root',
})
export class OrderManagementAgencyService extends DestroyableDirective {
  public orderPerDiemId$: Subject<number> = new Subject<number>();

  private _orderPerDiemId: number | null;

  constructor() {
    super();
    this.orderPerDiemId$.pipe(takeUntil(this.destroy$)).subscribe((id: number) => (this.orderPerDiemId = id));
  }

  set orderPerDiemId(value: number | null) {
    this._orderPerDiemId = value;
  }

  get orderPerDiemId(): number | null {
    return this._orderPerDiemId;
  }
}
