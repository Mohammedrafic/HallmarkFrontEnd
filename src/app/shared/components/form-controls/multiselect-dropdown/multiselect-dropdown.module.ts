import { MultiSelectModule } from '@syncfusion/ej2-angular-dropdowns';
import { CheckBoxSelectionService } from '@syncfusion/ej2-angular-dropdowns';

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { MultiselectDropdownComponent } from './multiselect-dropdown.component';
import { FormControlWrapperModule } from '@shared/components/form-controls/form-control-wrapper/form-control-wrapper.module';

@NgModule({
  declarations: [MultiselectDropdownComponent],
  imports: [CommonModule, MultiSelectModule, FormControlWrapperModule, ReactiveFormsModule],
  exports: [MultiselectDropdownComponent],
  providers: [CheckBoxSelectionService]
})
export class MultiselectDropdownModule {}
