import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WidgetWrapperComponent } from './widget-wrapper.component';
import { InlineLoaderModule } from '@shared/components/inline-loader/inline-loader.module';
import { TooltipModule } from '@syncfusion/ej2-angular-popups';
import { FeatherModule } from 'angular-feather';
import { Info } from 'angular-feather/icons';

@NgModule({
  declarations: [WidgetWrapperComponent],
  exports: [WidgetWrapperComponent],
  imports: [CommonModule, InlineLoaderModule, TooltipModule, FeatherModule.pick({ Info })],
})
export class WidgetWrapperModule {}
