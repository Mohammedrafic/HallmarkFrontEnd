import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ButtonModule } from '@syncfusion/ej2-angular-buttons';
import { TooltipModule } from '@syncfusion/ej2-angular-popups';
import { FeatherModule } from 'angular-feather';
import { AlertTriangle, Briefcase, Calendar, Clock, X } from 'angular-feather/icons';

import { IconMultiDatePickerModule } from '@shared/components/icon-multi-date-picker/icon-multi-date-picker.module';
import { ScheduleItemsService } from '../../services/schedule-items.service';
import { ScheduleItemsComponent } from "./schedule-items.component";

const icons = {
  X,
  Clock,
  AlertTriangle,
  Briefcase,
  Calendar,
};

@NgModule({
  declarations: [
    ScheduleItemsComponent,
  ],
  imports: [
    CommonModule,
    ButtonModule,
    FeatherModule.pick(icons),
    IconMultiDatePickerModule,
    TooltipModule,
  ],
  exports: [ScheduleItemsComponent],
  providers: [ScheduleItemsService],
})
export class ScheduleItemsModule { }
