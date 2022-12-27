import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScheduleCardComponent } from './schedule-card.component';
import { FeatherModule } from 'angular-feather';
import { AlertTriangle, Calendar, Clock } from 'angular-feather/icons';
import { TooltipModule } from '@syncfusion/ej2-angular-popups';
import { TooltipContainerModule } from '@shared/components/tooltip-container/tooltip.module';

const icons = {
  AlertTriangle,
  Calendar,
  Clock,
};

@NgModule({
  declarations: [
    ScheduleCardComponent,
  ],
  exports: [
    ScheduleCardComponent,
  ],
  imports: [
    CommonModule,
    FeatherModule.pick(icons),
    TooltipModule,
    TooltipContainerModule
  ]
})
export class ScheduleCardModule { }
