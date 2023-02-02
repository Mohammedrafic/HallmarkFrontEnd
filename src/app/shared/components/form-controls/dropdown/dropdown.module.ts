import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { DropdownComponent } from './dropdown.component';
import { FormControlWrapperModule } from '@shared/components/form-controls/form-control-wrapper/form-control-wrapper.module';
import { ErrorMessageModule } from '@shared/components/error-message/error-message.module';

@NgModule({
  declarations: [DropdownComponent],
  exports: [DropdownComponent],
  imports: [CommonModule, FormControlWrapperModule, ReactiveFormsModule, DropDownListModule, ErrorMessageModule]
})
export class DropdownModule {}
