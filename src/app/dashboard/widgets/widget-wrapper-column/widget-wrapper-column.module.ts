import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WidgetWrapperColumnComponent } from './widget-wrapper-column.component';
import { InlineLoaderModule } from '@shared/components/inline-loader/inline-loader.module';

@NgModule({
  declarations: [WidgetWrapperColumnComponent],
  exports: [WidgetWrapperColumnComponent],
  imports: [CommonModule, InlineLoaderModule],
})
export class WidgetWrapperColumnModule {}
