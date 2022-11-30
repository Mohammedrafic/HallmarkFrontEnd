import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ButtonModule } from '@syncfusion/ej2-angular-buttons';

import { DialogModule } from '@syncfusion/ej2-angular-popups';
import { FeatherModule } from 'angular-feather';
import { X } from 'angular-feather/icons';

import { InvoicePaymentDetailsComponent } from './invoice-payment-details.component';

@NgModule({
  imports: [
    CommonModule,
    DialogModule,
    FeatherModule.pick({ X }),
    ButtonModule,
  ],
  declarations: [InvoicePaymentDetailsComponent],
  exports: [InvoicePaymentDetailsComponent],
})
export class InvoicePaymentDetailsModule {}
