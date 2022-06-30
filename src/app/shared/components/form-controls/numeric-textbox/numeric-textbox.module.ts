import { NumericTextBoxModule } from '@syncfusion/ej2-angular-inputs';

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { NumericTextboxComponent } from './numeric-textbox.component';
import { FormControlWrapperModule } from '@shared/components/form-controls/form-control-wrapper/form-control-wrapper.module';

@NgModule({
  declarations: [NumericTextboxComponent],
  imports: [CommonModule, NumericTextBoxModule, ReactiveFormsModule, FormControlWrapperModule],
  exports: [
    NumericTextboxComponent
  ]
})
export class NumericTextboxModule {}
