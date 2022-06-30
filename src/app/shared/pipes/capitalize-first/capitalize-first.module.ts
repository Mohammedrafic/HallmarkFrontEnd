import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';

import { CapitalizeFirstPipe } from '@shared/pipes/capitalize-first/capitalize-first.pipe';

@NgModule({
  declarations: [CapitalizeFirstPipe],
  imports: [CommonModule],
  exports: [CapitalizeFirstPipe]
})
export class CapitalizeFirstModule {}
