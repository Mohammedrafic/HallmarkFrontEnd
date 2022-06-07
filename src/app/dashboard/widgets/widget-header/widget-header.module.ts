import { NgModule } from '@angular/core';

import { WidgetHeaderComponent } from './widget-header.component';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [CommonModule],
  exports: [WidgetHeaderComponent],
  declarations: [WidgetHeaderComponent],
})
export class WidgetHeaderModule {}
