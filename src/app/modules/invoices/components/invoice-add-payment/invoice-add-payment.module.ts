import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { ReactiveFormsModule } from '@angular/forms';
import { DialogModule } from '@syncfusion/ej2-angular-popups';
import { AgGridModule } from '@ag-grid-community/angular';
import { ButtonModule, SwitchAllModule } from '@syncfusion/ej2-angular-buttons';
import { DatePickerAllModule } from '@syncfusion/ej2-angular-calendars';
import { Trash2 } from 'angular-feather/icons';
import { FeatherModule } from 'angular-feather';

import { InvoiceAddPaymentComponent } from './invoice-add-payment.component';
import { InvoiceAddPaymentService } from './invoice-add-payment.service';
import { InputEditorComponent } from './cell-renderers/input-editor/input-editor.component';
import { PaymentDeleteRendererComponent } from './cell-renderers/payment-delete-renderer/payment-delete-renderer.component';
import { BalanceRendererComponent } from './cell-renderers/balance-renderer/balance-renderer.component';
import { ValidateDirectiveModule } from '@shared/directives/validate-directive/validate-directive.module';
import { GridModule } from '@shared/components/grid/grid.module';

@NgModule({
  declarations: [
    InvoiceAddPaymentComponent,
    InputEditorComponent,
    PaymentDeleteRendererComponent,
    BalanceRendererComponent,
  ],
  imports: [
    CommonModule,
    DropDownListModule,
    ReactiveFormsModule,
    DialogModule,
    AgGridModule,
    SwitchAllModule,
    DatePickerAllModule,
    ButtonModule,
    FeatherModule.pick({Trash2}),
    ValidateDirectiveModule,
    GridModule
  ],
  exports: [InvoiceAddPaymentComponent],
  providers: [InvoiceAddPaymentService],
})
export class InvoiceAddPaymentModule {}
