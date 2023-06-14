import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';

import { DestroyDialog } from '@core/helpers';

@Component({
  selector: 'app-replacement-pd-orders-dialog',
  templateUrl: './replacement-pd-orders-dialog.component.html',
  styleUrls: ['./replacement-pd-orders-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReplacementPdOrdersDialogComponent extends DestroyDialog implements OnInit {
  @Input() closingDate: Date;

  @Output() createOrders: EventEmitter<boolean> = new EventEmitter<boolean>();

  ngOnInit(): void {
    this.watchForCloseStream();
  }

  create(): void {
    this.createOrders.emit(true);
    this.closeDialog();
  }

  remove(): void {
    this.createOrders.emit(false);
    this.closeDialog();
  }

  closeOnEscape(): void {
    this.destroyableDialog.hide();
    this.destroyDialog.emit();
  }
}
