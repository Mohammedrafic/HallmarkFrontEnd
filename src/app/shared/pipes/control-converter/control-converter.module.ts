import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';

import { ControlConverterPipe } from '@shared/pipes/control-converter/control-converter.pipe';

@NgModule({
  declarations: [ControlConverterPipe],
  imports: [CommonModule],
  exports: [ControlConverterPipe]
})
export class ControlConverterModule {}
