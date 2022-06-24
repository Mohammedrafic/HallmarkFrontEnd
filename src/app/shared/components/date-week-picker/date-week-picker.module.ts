import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { DatePickerModule } from '@syncfusion/ej2-angular-calendars';

import { DateWeekPickerComponent } from '@shared/components/date-week-picker/date-week-picker.component';
import { DateWeekPickerService } from '@shared/components/date-week-picker/date-week-picker.service';

@NgModule({
  declarations: [DateWeekPickerComponent],
  imports: [CommonModule, DatePickerModule, ReactiveFormsModule],
  exports: [DateWeekPickerComponent],
  providers: [DateWeekPickerService]
})
export class DateWeekPickerModule {}
