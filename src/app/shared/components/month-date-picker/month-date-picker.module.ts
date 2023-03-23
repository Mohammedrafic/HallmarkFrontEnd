import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { DatePickerModule } from '@syncfusion/ej2-angular-calendars';
import { FeatherModule } from 'angular-feather';
import { ChevronLeft, ChevronRight } from 'angular-feather/icons';
import { ButtonAllModule } from '@syncfusion/ej2-angular-buttons';

import { MonthDatePickerComponent } from './month-date-picker.component';
import { DateWeekService } from '@core/services';
import { MonthPickerService } from '@shared/components/month-date-picker/month-picker.service';

@NgModule({
  exports: [MonthDatePickerComponent],
  declarations: [
    MonthDatePickerComponent,
  ],
  imports: [
    CommonModule,
    FeatherModule.pick({ ChevronRight, ChevronLeft }),
    DatePickerModule,
    ButtonAllModule,
    ReactiveFormsModule,
  ],
  providers: [DateWeekService, MonthPickerService],
})
export class MonthDatePickerModule { }
