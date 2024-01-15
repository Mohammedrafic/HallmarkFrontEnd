import { Component, OnInit, ChangeDetectionStrategy, Input, TrackByFunction, Output, EventEmitter } from '@angular/core';

import { DestroyDialog } from '@core/helpers';

import { RemainingBooking } from './remaining-booking.interface';

@Component({
  selector: 'app-remaining-booking-dialog',
  templateUrl: './remaining-booking-dialog.component.html',
  styleUrls: ['./remaining-booking-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RemainingBookingDialogComponent extends DestroyDialog implements OnInit {
  @Input() remainingBookings: RemainingBooking[] = [];

  @Output() partialFloat: EventEmitter<boolean> = new EventEmitter<boolean>();

  trackByStartTime: TrackByFunction<RemainingBooking> = (_: number, item: RemainingBooking) => item.startTime;

  ngOnInit(): void {
    this.watchForCloseStream();
  }

  cancelRemainingBooking(): void {
    this.partialFloat.emit(false);
    this.closeDialog();
  }

  divideBooking(): void {
    this.partialFloat.emit(true);
    this.closeDialog();
  }

  closeOnEscape(): void {
    this.destroyableDialog.hide();
    this.destroyDialog.emit();
  }
}
