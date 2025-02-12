import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { ButtonModule } from '@syncfusion/ej2-angular-buttons';
import { AutoCompleteModule } from '@syncfusion/ej2-angular-dropdowns';
import { FeatherModule } from 'angular-feather';
import { Search, Slash } from 'angular-feather/icons';

import { DateWeekService } from '@core/services';
import { DateWeekPickerModule } from '@shared/components/date-week-picker';
import { SharedModule } from '@shared/shared.module';
import { TooltipContainerModule } from '@shared/components/tooltip-container/tooltip.module';
import { PeriodPickerModule } from '@shared/components/period-picker';
import { MonthDatePickerModule } from '@shared/components/month-date-picker/month-date-picker.module';

import { WeeksEndModule } from '../../directives/weeks-end/weeks-end.module';
import { CalendarDateSlotModule } from '../../pipes/calendar-date-slot/calendar-date-slot.module';
import { CandidateCardModule } from '../candidate-card/candidate-card.module';
import { ScheduleCardModule } from '../schedule-card/schedule-card.module';
import { ScheduleGridComponent } from './schedule-grid.component';
import { CalendarTooltipSlotModule } from '../../pipes/calendar-tooltip-slot/calendar-tooltip-slot.module';
import { MonthViewGridModule } from '../month-view-grid/month-view-grid.module';
import { ScheduleGridService } from './schedule-grid.service';
import { CanScheduleModule } from '../../directives/can-schedule/can-schedule.module';
import { ReplacementOrderDialogModule } from '../replacement-order-dialog/replacement-order-dialog.module';
import { ExportCalendarDateSlotModule } from '../../pipes/calendar-date-slot/export-calendar-date-slot.module';

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
        ExportCalendarDateSlotModule,
        AutoCompleteModule,
        CalendarTooltipSlotModule,
        PeriodPickerModule,
        TooltipContainerModule,
        MonthViewGridModule,
        MonthDatePickerModule,
        WeeksEndModule,
        DragDropModule,
        CanScheduleModule,
        ReplacementOrderDialogModule,
    ],
  exports: [ScheduleGridComponent],
  providers: [DateWeekService, ScheduleGridService],
})
export class ScheduleGridModule { }
