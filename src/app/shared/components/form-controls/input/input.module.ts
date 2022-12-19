import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { InputComponent } from './input.component';
import { FormControlWrapperModule } from '@shared/components/form-controls/form-control-wrapper/form-control-wrapper.module';
import { SharedModule } from '@shared/shared.module';
import { NgxMaskModule } from 'ngx-mask';
import { ValidateDirectiveModule } from '@shared/directives/validate-directive/validate-directive.module';

@NgModule({
  declarations: [InputComponent],
  imports: [CommonModule, FormControlWrapperModule, ReactiveFormsModule, SharedModule, NgxMaskModule, ValidateDirectiveModule],
  exports: [InputComponent]
})
export class InputModule {}
