import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BoolValuePipe } from './bool-values.pipe';

@NgModule({
  imports: [CommonModule],
  declarations: [BoolValuePipe],
  exports: [BoolValuePipe],
})
export class BoolValuePipeModule {}