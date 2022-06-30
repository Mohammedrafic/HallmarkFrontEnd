import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { FormControlWrapperComponent } from './form-control-wrapper.component';

@NgModule({
  declarations: [FormControlWrapperComponent],
  exports: [FormControlWrapperComponent],
  imports: [CommonModule, ReactiveFormsModule],
})
export class FormControlWrapperModule {}
