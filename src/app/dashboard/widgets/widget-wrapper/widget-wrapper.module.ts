import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WidgetWrapperComponent } from './widget-wrapper.component';

@NgModule({
  declarations: [WidgetWrapperComponent],
  exports: [WidgetWrapperComponent],
  imports: [CommonModule],
})
export class WidgetWrapperModule {}
