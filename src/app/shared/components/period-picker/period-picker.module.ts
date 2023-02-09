import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { DatePickerModule } from '@syncfusion/ej2-angular-calendars';
import { ButtonModule } from '@syncfusion/ej2-angular-buttons';
import { ChevronRight, ChevronLeft } from 'angular-feather/icons';
import { FeatherModule } from 'angular-feather';

import { PeriodPickerComponent } from './period-picker.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    DatePickerModule,
    ButtonModule,
    FeatherModule.pick({ChevronRight, ChevronLeft}),
    ReactiveFormsModule,
  ],
  declarations: [PeriodPickerComponent],
  exports:[PeriodPickerComponent],
})
export class PeriodPickerModule {}