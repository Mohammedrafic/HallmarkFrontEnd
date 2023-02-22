import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MultiDatePickerComponent } from '@shared/components/multi-date-picker/multi-date-picker.component';
import { CalendarModule } from '@syncfusion/ej2-angular-calendars';
import { ReactiveFormsModule } from '@angular/forms';
import { FeatherModule } from 'angular-feather';
import { X } from 'angular-feather/icons';
import { ValidateDirectiveModule } from '@shared/directives/validate-directive/validate-directive.module';
import { ValidationErrorModule } from '@shared/pipes/validation-error/validation.error.module';

@NgModule({
  declarations: [MultiDatePickerComponent],
  imports: [
    CommonModule,
    CalendarModule,
    ReactiveFormsModule,
    FeatherModule.pick({ X }),
    ValidateDirectiveModule,
    ValidationErrorModule,
  ],
  exports: [MultiDatePickerComponent],
})
export class MultiDatePickerModule {}
