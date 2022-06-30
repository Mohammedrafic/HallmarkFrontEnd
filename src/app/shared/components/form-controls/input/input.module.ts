import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { InputComponent } from './input.component';
import { FormControlWrapperModule } from '@shared/components/form-controls/form-control-wrapper/form-control-wrapper.module';

@NgModule({
  declarations: [InputComponent],
  imports: [CommonModule, FormControlWrapperModule, ReactiveFormsModule],
  exports: [InputComponent],
})
export class InputModule {}
