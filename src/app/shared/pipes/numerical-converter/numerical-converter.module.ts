import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NumericalConverterPipe } from '@shared/pipes/numerical-converter/numerical-converter.pipe';

@NgModule({
  declarations: [NumericalConverterPipe],
  imports: [CommonModule],
  exports: [NumericalConverterPipe],
})
export class NumericalConverterModule {}
