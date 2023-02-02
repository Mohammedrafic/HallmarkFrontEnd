import { CheckBoxSelectionService, MultiSelectModule } from '@syncfusion/ej2-angular-dropdowns';

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { MultiselectDropdownComponent } from './multiselect-dropdown.component';
import { FormControlWrapperModule } from '@shared/components/form-controls/form-control-wrapper/form-control-wrapper.module';
import { SharedModule } from '@shared/shared.module';
import { ValidateDirectiveModule } from '@shared/directives/validate-directive/validate-directive.module';
import { ErrorMessageModule } from '@shared/components/error-message/error-message.module';

@NgModule({
  declarations: [MultiselectDropdownComponent],
  imports: [CommonModule, MultiSelectModule, FormControlWrapperModule, ReactiveFormsModule, SharedModule, ValidateDirectiveModule, ErrorMessageModule],
  exports: [MultiselectDropdownComponent],
  providers: [CheckBoxSelectionService]
})
export class MultiselectDropdownModule {}
