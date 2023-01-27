import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ChipListModule } from '@syncfusion/ej2-angular-buttons';

import { InlineChipsComponent } from './inline-chips.component';
import { ElemetOverflowDirectiveModule } from '@shared/directives/resize-directive';

@NgModule({
  imports: [
    CommonModule,
    ChipListModule,
    ElemetOverflowDirectiveModule,
  ],
  declarations: [InlineChipsComponent],
  exports: [InlineChipsComponent],
})
export class InlineChipsModule {}