import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ButtonModule } from '@syncfusion/ej2-angular-buttons';
import { AutoCompleteModule } from '@syncfusion/ej2-angular-dropdowns';
import { FeatherModule } from 'angular-feather';
import { Search, Slash } from 'angular-feather/icons';

import { DateWeekService } from '@core/services';
import { DateWeekPickerModule } from '@shared/components/date-week-picker';
import { SharedModule } from '@shared/shared.module';
import { TooltipContainerModule } from '@shared/components/tooltip-container/tooltip.module';

import { WeeksEndModule } from '../../directives/weeks-end/weeks-end.module';
import { CalendarDateSlotModule } from '../../pipes/calendar-date-slot/calendar-date-slot.module';
import { CandidateCardModule } from '../candidate-card/candidate-card.module';
import { ScheduleCardModule } from '../schedule-card/schedule-card.module';
import { ScheduleGridComponent } from './schedule-grid.component';
import { CalendarTooltipSlotModule } from '../../pipes/calendar-tooltip-slot/calendar-tooltip-slot.module';
import { PeriodPickerModule } from '@shared/components/period-picker';
import { MonthViewGridModule } from '../month-view-grid/month-view-grid.module';
import { MonthDatePickerModule } from '@shared/components/month-date-picker/month-date-picker.module';
import { ScheduleGridService } from './schedule-grid.service';

const icons = {
  Search,
  Slash,
};

@NgModule({
  declarations: [
    ScheduleGridComponent,
  ],
    imports: [
        CommonModule,
        FeatherModule.pick(icons),
        SharedModule,
        ButtonModule,
        DateWeekPickerModule,
        CandidateCardModule,
        ScheduleCardModule,
        CalendarDateSlotModule,
        AutoCompleteModule,
        CalendarTooltipSlotModule,
        PeriodPickerModule,
        TooltipContainerModule,
        MonthViewGridModule,
        MonthDatePickerModule,
        WeeksEndModule,
    ],
  exports: [ScheduleGridComponent],
  providers: [DateWeekService, ScheduleGridService],
})
export class ScheduleGridModule { }
