import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WidgetWrapperComponent } from './widget-wrapper.component';
import { InlineLoaderModule } from '@shared/components/inline-loader/inline-loader.module';

@NgModule({
  declarations: [WidgetWrapperComponent],
  exports: [WidgetWrapperComponent],
  imports: [CommonModule, InlineLoaderModule],
})
export class WidgetWrapperModule {}
