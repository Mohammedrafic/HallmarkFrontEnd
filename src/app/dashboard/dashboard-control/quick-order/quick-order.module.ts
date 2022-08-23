import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ButtonModule } from '@syncfusion/ej2-angular-buttons';
import { DialogModule } from '@syncfusion/ej2-angular-popups';
import { QuickOrderComponent } from './quick-order.component';
import { QuickOrderFormComponent } from './quick-order-form/quick-order-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { DropDownListModule, MultiSelectAllModule } from '@syncfusion/ej2-angular-dropdowns';
import { DatePickerModule, TimePickerModule } from '@syncfusion/ej2-angular-calendars';
import { NumericTextBoxModule, TextBoxModule } from '@syncfusion/ej2-angular-inputs';

@NgModule({
  imports: [
    CommonModule,
    DialogModule,
    ButtonModule,
    ReactiveFormsModule,
    DropDownListModule,
    DatePickerModule,
    MultiSelectAllModule,
    TimePickerModule,
    TextBoxModule,
    NumericTextBoxModule,
  ],
  declarations: [QuickOrderComponent, QuickOrderFormComponent],
  exports: [QuickOrderComponent],
})
export class QuickOrderModule {}
