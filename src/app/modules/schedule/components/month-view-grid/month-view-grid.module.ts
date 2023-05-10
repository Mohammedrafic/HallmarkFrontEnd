import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { FeatherModule } from 'angular-feather';
import { Slash } from 'angular-feather/icons';

import { SharedModule } from '@shared/shared.module';
import { TooltipContainerModule } from '@shared/components/tooltip-container/tooltip.module';
import { WeeksEndModule } from '../../directives/weeks-end/weeks-end.module';
import { MonthViewGridComponent } from './month-view-grid.component';
import { CandidateCardModule } from '../candidate-card/candidate-card.module';
import { CalendarDateSlotModule } from '../../pipes/calendar-date-slot/calendar-date-slot.module';
import { CalendarTooltipSlotModule } from '../../pipes/calendar-tooltip-slot/calendar-tooltip-slot.module';
import { MonthCardComponent } from './month-card/month-card.component';
import { CanScheduleModule } from '../../directives/can-schedule/can-schedule.module';

@NgModule({
  exports: [MonthViewGridComponent],
  declarations: [
    MonthViewGridComponent,
    MonthCardComponent,
  ],
    imports: [
        CommonModule,
        CandidateCardModule,
        CalendarDateSlotModule,
        TooltipContainerModule,
        CalendarTooltipSlotModule,
        SharedModule,
        WeeksEndModule,
        FeatherModule.pick({ Slash }),
        DragDropModule,
        CanScheduleModule,
    ],
})
export class MonthViewGridModule { }
