import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WidgetWrapperModule } from '../widget-wrapper/widget-wrapper.module';
import { TooltipModule } from '@syncfusion/ej2-angular-popups';
import { FeatherModule } from 'angular-feather';
import { Info } from 'angular-feather/icons';
import { AgencyTimesheetSummaryComponent } from './agency-timesheet-summary.component';

@NgModule({
  imports: [WidgetWrapperModule, CommonModule, TooltipModule, FeatherModule.pick({ Info })],
  exports: [AgencyTimesheetSummaryComponent],
  declarations: [AgencyTimesheetSummaryComponent],
})
export class AgencyTimesheetWidgetModule {}
