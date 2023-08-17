import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseExportComponent } from './components/base-export/base-export.component';
import { ScheduleExportRoutingModule } from './schedule-export-routing.module';
import { DateWeekService } from '@core/services/date-week.service';
import { ScheduleItemsService } from '../modules/schedule/services/schedule-items.service';
import { CreateScheduleService } from '../modules/schedule/services/create-schedule.service';
import { OpenPositionService, ScheduleApiService, ScheduleFiltersService } from '../modules/schedule/services';
import { ScheduleGridService } from '../modules/schedule/components/schedule-grid/schedule-grid.service';
import { WeeksEndModule } from '../modules/schedule/directives/weeks-end/weeks-end.module';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FeatherModule } from 'angular-feather';
import { Search, Slash } from 'angular-feather/icons';
import { ExportScheduleCardModule } from '../modules/schedule/components/export-schedule-card/export-schedule-card.module';
import { TooltipContainerModule } from '@shared/components/tooltip-container/tooltip.module';
import { CanScheduleModule } from '../modules/schedule/directives/can-schedule/can-schedule.module';
import { MonthPickerService } from '@shared/components/month-date-picker';
import { ExportMonthViewModule } from '../modules/schedule/components/export-month-view/export-month-view.module';
import { ExportCalendarDateSlotModule } from '../modules/schedule/pipes/calendar-date-slot/export-calendar-date-slot.module';

const icons = {
  Search,
  Slash,
};

@NgModule({
  declarations: [BaseExportComponent],
  exports: [],
  imports: [
    ScheduleExportRoutingModule, 
    CommonModule, 
    WeeksEndModule, 
    ExportCalendarDateSlotModule,
    DragDropModule,
    FeatherModule.pick(icons),
    TooltipContainerModule,
    CanScheduleModule,
    ExportScheduleCardModule,
    ExportMonthViewModule,
  ],
  providers: [
    DateWeekService, 
    ScheduleItemsService, 
    CreateScheduleService, 
    ScheduleFiltersService,
    ScheduleGridService,
    MonthPickerService,
    OpenPositionService,
    ScheduleApiService
  ]
})
export class ScheduleExportModule {}
