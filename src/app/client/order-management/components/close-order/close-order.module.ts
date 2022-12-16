import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatepickerModule } from '@shared/components/form-controls/datepicker/datepicker.module';
import { SharedModule } from '@shared/shared.module';
import { CloseOrderComponent } from '@client/order-management/components/close-order/close-order.component';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { ReactiveFormsModule } from '@angular/forms';
import { FeatherModule } from 'angular-feather';

@NgModule({
  declarations: [CloseOrderComponent],
  imports: [CommonModule, ReactiveFormsModule, FeatherModule, DropDownListModule, DatepickerModule, SharedModule],
  exports: [CloseOrderComponent],
})
export class CloseOrderModule {}
