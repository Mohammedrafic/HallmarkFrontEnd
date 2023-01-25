import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ButtonModule } from '@syncfusion/ej2-angular-buttons';
import { AutoCompleteModule } from '@syncfusion/ej2-angular-dropdowns';
import { FeatherModule } from 'angular-feather';
import { Search } from 'angular-feather/icons';

import { DateWeekService } from '@core/services';
import { DateWeekPickerModule } from '@shared/components/date-week-picker';
import { SharedModule } from '@shared/shared.module';

import { CalendarDateSlotModule } from '../../pipes/calendar-date-slot/calendar-date-slot.module';
import { CandidateCardModule } from '../candidate-card/candidate-card.module';
import { ScheduleCardModule } from '../schedule-card/schedule-card.module';
import { ScheduleGridComponent } from './schedule-grid.component';
import { CalendarTooltipSlotModule } from '../../pipes/calendar-tooltip-slot/calendar-tooltip-slot.module';

const icons = {
  Search,
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
  ],
  exports: [ScheduleGridComponent],
  providers: [DateWeekService],
})
export class ScheduleGridModule { }
