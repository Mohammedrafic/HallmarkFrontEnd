import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TooltipModule } from '@syncfusion/ej2-angular-popups';
import { TooltipContainerModule } from '@shared/components/tooltip-container/tooltip.module';
import { AlertTriangle, Briefcase, Calendar, Clock } from 'angular-feather/icons';
import { FeatherModule } from 'angular-feather';

import { ScheduleCardService } from '../../services';
import { ExportScheduleCardComponent } from './export-schedule-card.component';

const icons = {
  AlertTriangle,
  Calendar,
  Clock,
  Briefcase,
};

@NgModule({
  declarations: [
    ExportScheduleCardComponent,
  ],
  exports: [
    ExportScheduleCardComponent,
  ],
    imports: [
        CommonModule,
        FeatherModule.pick(icons),
        TooltipModule,
        TooltipContainerModule,
    ],
  providers: [ScheduleCardService],
})
export class ExportScheduleCardModule { }
