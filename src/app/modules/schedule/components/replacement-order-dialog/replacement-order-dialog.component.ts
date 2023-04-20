import { Component, OnInit, ChangeDetectionStrategy, Input, TrackByFunction, Output, EventEmitter } from '@angular/core';

import { DestroyDialog } from '@core/helpers';
import { BookingsOverlapsResponse } from './replacement-order.interface';

@Component({
  selector: 'app-replacement-order-dialog',
  templateUrl: './replacement-order-dialog.component.html',
  styleUrls: ['./replacement-order-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReplacementOrderDialogComponent extends DestroyDialog implements OnInit {
  @Input() replacementOrderData: BookingsOverlapsResponse[] = [];
  @Input() isRemoveMode = false;

  @Output() createOrder: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() removeOrder: EventEmitter<boolean> = new EventEmitter<boolean>();

  trackByEmployeeId: TrackByFunction<BookingsOverlapsResponse> =
    (_: number, item: BookingsOverlapsResponse) => item.employeeId;

  ngOnInit(): void {
    this.watchForCloseStream();
  }

  create(): void {
    this.handleOrderAction(true);
    this.closeDialog();
  }

  remove(): void {
    this.handleOrderAction(false);
    this.closeDialog();
  }

  closeOnEscape(): void {
    this.destroyableDialog.hide();
    this.destroyDialog.emit();
  }

  private handleOrderAction(value: boolean): void {
    if(this.isRemoveMode) {
      this.removeOrder.emit(value);
    } else {
      this.createOrder.emit(value);
    }
  }
}
