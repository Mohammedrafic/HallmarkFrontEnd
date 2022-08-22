import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ButtonModule } from '@syncfusion/ej2-angular-buttons';
import { DialogModule } from '@syncfusion/ej2-angular-popups';
import { QuickOrderComponent } from './quick-order.component';
import { QuickOrderFormComponent } from './quick-order-form/quick-order-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { DatePickerModule } from '@syncfusion/ej2-angular-calendars';

@NgModule({
  imports: [CommonModule, DialogModule, ButtonModule, ReactiveFormsModule, DropDownListModule, DatePickerModule],
  declarations: [QuickOrderComponent, QuickOrderFormComponent],
  exports: [QuickOrderComponent],
})
export class QuickOrderModule {}
