import { MaskedDateTimeService, TimePickerModule } from '@syncfusion/ej2-angular-calendars';

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormControlWrapperModule } from '@shared/components/form-controls/form-control-wrapper/form-control-wrapper.module';
import { ReactiveFormsModule } from '@angular/forms';
import { TimepickerComponent } from '@shared/components/form-controls/timepicker/timepicker.component';
import { ErrorMessageModule } from '@shared/components/error-message/error-message.module';

@NgModule({
  declarations: [TimepickerComponent],
  imports: [CommonModule, FormControlWrapperModule, ReactiveFormsModule, TimePickerModule, ErrorMessageModule],
  exports: [TimepickerComponent],
  providers: [MaskedDateTimeService],
})
export class TimepickerModule {}
