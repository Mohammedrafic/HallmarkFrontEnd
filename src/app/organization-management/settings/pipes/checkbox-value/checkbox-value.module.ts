import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CheckboxValuePipe } from './checkbox-value.pipe';

@NgModule({
  declarations: [CheckboxValuePipe],
  imports: [CommonModule],
  exports: [CheckboxValuePipe],
})
export class CheckboxValueModule { }
