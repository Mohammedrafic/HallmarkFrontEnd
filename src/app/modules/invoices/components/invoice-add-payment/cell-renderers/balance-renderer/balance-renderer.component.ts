import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { distinctUntilChanged, startWith, takeUntil } from 'rxjs';

import { Destroyable } from '@core/helpers';

@Component({
  selector: 'app-balance-renderer',
  templateUrl: './balance-renderer.component.html',
  styleUrls: ['./balance-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BalanceRendererComponent extends Destroyable implements ICellRendererAngularComp {
  balance: number;
  
  private group: FormGroup;

  private initialAmount: number;

  constructor(
    private cd: ChangeDetectorRef,
  ) {
    super();
  }

  agInit(params: ICellRendererParams): void {
    this.group = params.data.group;
    this.initialAmount = params.data.amount;
    this.balance = params.data.balance;
    this.watchForAmountControl();
  }

  refresh(): boolean {
    return true;
  }

  private watchForAmountControl(): void {
    this.group.get('amount')?.valueChanges
    .pipe(
      distinctUntilChanged(),
      takeUntil(this.componentDestroy()),
      startWith(this.group.get('amount')?.value)
    ).subscribe((value) => {
      this.balance = this.initialAmount - value;
      this.group.get('balance')?.patchValue(this.balance, { emitEvent: false, onlySelf: true });
      this.cd.markForCheck();
    });
  }
}
