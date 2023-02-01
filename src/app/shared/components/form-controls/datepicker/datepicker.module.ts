import { DatePickerModule, MaskedDateTimeService } from '@syncfusion/ej2-angular-calendars';

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DatepickerComponent } from '@shared/components/form-controls/datepicker/datepicker.component';
import { FormControlWrapperModule } from '@shared/components/form-controls/form-control-wrapper/form-control-wrapper.module';
import { ReactiveFormsModule } from '@angular/forms';
import { ErrorMessageModule } from '@shared/components/error-message/error-message.module';

@NgModule({
  declarations: [DatepickerComponent],
  imports: [CommonModule, FormControlWrapperModule, ReactiveFormsModule, DatePickerModule, ErrorMessageModule],
  exports: [DatepickerComponent],
  providers: [MaskedDateTimeService],
})
export class DatepickerModule {}
