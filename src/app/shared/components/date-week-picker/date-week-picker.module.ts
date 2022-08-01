import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { DatePickerModule } from '@syncfusion/ej2-angular-calendars';
import { ButtonAllModule } from '@syncfusion/ej2-angular-buttons';

import { DateWeekPickerComponent } from '@shared/components/date-week-picker/date-week-picker.component';
import { FeatherModule } from 'angular-feather';
import { ChevronLeft, ChevronRight } from 'angular-feather/icons';

@NgModule({
  declarations: [DateWeekPickerComponent],
  imports: [
    CommonModule,
    DatePickerModule,
    ReactiveFormsModule,
    ButtonAllModule,
    FeatherModule.pick({ChevronRight, ChevronLeft}),
  ],
  exports: [DateWeekPickerComponent],
})
export class DateWeekPickerModule {}
