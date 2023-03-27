import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UpcomingExpCredsComponent } from './upcoming-exp-creds.component';
import { WidgetWrapperModule } from '../widget-wrapper/widget-wrapper.module';
import { TooltipModule } from '@syncfusion/ej2-angular-popups';
import { FeatherModule } from 'angular-feather';
import { Info } from 'angular-feather/icons';
import { ProgressBarAllModule } from '@syncfusion/ej2-angular-progressbar';

@NgModule({
  imports: [WidgetWrapperModule, CommonModule, TooltipModule, FeatherModule.pick({ Info }),ProgressBarAllModule],
  exports: [UpcomingExpCredsComponent],
  declarations: [UpcomingExpCredsComponent],
})
export class UpcomingExpCredsModule {}
