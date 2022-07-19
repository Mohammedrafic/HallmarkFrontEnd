import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddEditReorderComponent } from '@client/order-management/add-edit-reorder/add-edit-reorder.component';
import { InputModule } from '@shared/components/form-controls/input/input.module';
import { MultiselectDropdownModule } from '@shared/components/form-controls/multiselect-dropdown/multiselect-dropdown.module';
import { DatepickerModule } from '@shared/components/form-controls/datepicker/datepicker.module';
import { TimepickerModule } from '@shared/components/form-controls/timepicker/timepicker.module';
import { NumericTextboxModule } from '@shared/components/form-controls/numeric-textbox/numeric-textbox.module';
import { SharedModule } from '@shared/shared.module';

@NgModule({
  declarations: [AddEditReorderComponent],
  imports: [
    CommonModule,
    NumericTextboxModule,
    InputModule,
    MultiselectDropdownModule,
    DatepickerModule,
    TimepickerModule,
    NumericTextboxModule,
    SharedModule,
  ],
  exports: [AddEditReorderComponent],
})
export class AddEditReorderModule {}
