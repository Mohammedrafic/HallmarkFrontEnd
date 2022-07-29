import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { DateRangePickerModule } from '@syncfusion/ej2-angular-calendars';

import { DateWeekPickerComponent } from '@shared/components/date-range-week-picker/date-range-week-picker.component';

@NgModule({
  declarations: [DateWeekPickerComponent],
  imports: [CommonModule, DateRangePickerModule, ReactiveFormsModule],
  exports: [DateWeekPickerComponent],
})
export class DateRangeWeekPickerModule {}
