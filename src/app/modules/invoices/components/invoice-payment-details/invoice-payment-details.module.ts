import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { AgGridModule } from '@ag-grid-community/angular';
import { ButtonModule } from '@syncfusion/ej2-angular-buttons';
import { DialogModule } from '@syncfusion/ej2-angular-popups';
import { FeatherModule } from 'angular-feather';
import { X, Edit } from 'angular-feather/icons';

import { InvoicePaymentDetailsComponent } from './invoice-payment-details.component';
import { EditPaymentRendererComponent } from './cell-renderers/edit-payment-renderer/edit-payment-renderer.component';
import { GridModule } from '@shared/components/grid/grid.module';

@NgModule({
  imports: [
    CommonModule,
    DialogModule,
    FeatherModule.pick({ X, Edit }),
    ButtonModule,
    AgGridModule,
    GridModule
  ],
  declarations: [InvoicePaymentDetailsComponent, EditPaymentRendererComponent],
  exports: [InvoicePaymentDetailsComponent],
})
export class InvoicePaymentDetailsModule {}
