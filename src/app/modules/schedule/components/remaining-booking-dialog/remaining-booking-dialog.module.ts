import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ButtonModule } from '@syncfusion/ej2-angular-buttons';
import { DialogModule } from "@syncfusion/ej2-angular-popups";

import { RemainingBookingDialogComponent } from './remaining-booking-dialog.component';


@NgModule({
  declarations: [RemainingBookingDialogComponent],
  imports: [
    CommonModule,
    ButtonModule,
    DialogModule,
  ],
  exports: [RemainingBookingDialogComponent],
})
export class RemainingBookingDialogModule { }
