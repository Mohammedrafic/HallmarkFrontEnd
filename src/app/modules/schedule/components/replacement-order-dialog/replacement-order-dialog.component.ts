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

  @Output() createOrder: EventEmitter<boolean> = new EventEmitter();

  trackByEmployeeId: TrackByFunction<BookingsOverlapsResponse> =
    (_: number, item: BookingsOverlapsResponse) => item.employeeId;

  ngOnInit(): void {
    this.watchForCloseStream();
  }

  create(): void {
    this.createOrder.emit(true);
    this.closeDialog();
  }

  remove(): void {
    this.createOrder.emit(false);
    this.closeDialog();
  }

  closeOnEscape(): void {
    this.destroyableDialog.hide();
    this.destroyDialog.emit();
  }
}
