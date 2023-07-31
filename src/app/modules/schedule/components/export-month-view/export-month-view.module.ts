import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { FeatherModule } from 'angular-feather';
import { Slash } from 'angular-feather/icons';

import { SharedModule } from '@shared/shared.module';
import { TooltipContainerModule } from '@shared/components/tooltip-container/tooltip.module';
import { WeeksEndModule } from '../../directives/weeks-end/weeks-end.module';
import { CandidateCardModule } from '../candidate-card/candidate-card.module';
import { CalendarTooltipSlotModule } from '../../pipes/calendar-tooltip-slot/calendar-tooltip-slot.module';
import { CanScheduleModule } from '../../directives/can-schedule/can-schedule.module';
import { ExportMonthViewComponent } from './export-month-view.component';
import { ExportMonthCardComponent } from './export-month-card/export-month-card.component';
import { ExportScheduleCardModule } from '../export-schedule-card/export-schedule-card.module';
import { ExportCalendarDateSlotModule } from '../../pipes/calendar-date-slot/export-calendar-date-slot.module';

@NgModule({
  exports: [ExportMonthViewComponent],
  declarations: [
    ExportMonthViewComponent,
    ExportMonthCardComponent,
  ],
    imports: [
        CommonModule,
        CandidateCardModule,
        ExportCalendarDateSlotModule,
        TooltipContainerModule,
        CalendarTooltipSlotModule,
        SharedModule,
        WeeksEndModule,
        FeatherModule.pick({ Slash }),
        DragDropModule,
        CanScheduleModule,
        ExportScheduleCardModule
    ],
})
export class ExportMonthViewModule { }
