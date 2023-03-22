import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MonthViewGridComponent } from './month-view-grid.component';
import { CandidateCardModule } from '../candidate-card/candidate-card.module';
import { CalendarDateSlotModule } from '../../pipes/calendar-date-slot/calendar-date-slot.module';
import { TooltipContainerModule } from '@shared/components/tooltip-container/tooltip.module';
import { CalendarTooltipSlotModule } from '../../pipes/calendar-tooltip-slot/calendar-tooltip-slot.module';
import { SharedModule } from '@shared/shared.module';
import { MonthCardComponent } from './month-card/month-card.component';
import { DoubleClickModule } from '@shared/directives/double-click/double-click.module';

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
    DoubleClickModule,
  ],
})
export class MonthViewGridModule { }
