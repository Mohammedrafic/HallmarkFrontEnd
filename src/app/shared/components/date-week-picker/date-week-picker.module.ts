import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';

import { DatePickerModule } from '@syncfusion/ej2-angular-calendars';

import { DateWeekPickerComponent } from '@shared/components/date-week-picker/date-week-picker.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [DateWeekPickerComponent],
  imports: [CommonModule, DatePickerModule, ReactiveFormsModule],
  exports: [DateWeekPickerComponent],
})
export class DateWeekPickerModule {}
