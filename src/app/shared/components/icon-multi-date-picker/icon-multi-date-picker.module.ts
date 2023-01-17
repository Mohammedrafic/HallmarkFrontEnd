import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ButtonModule } from '@syncfusion/ej2-angular-buttons';
import { CalendarModule } from '@syncfusion/ej2-angular-calendars';
import { FeatherModule } from 'angular-feather';
import { Calendar } from 'angular-feather/icons';

import { IconMultiDatePickerComponent } from './icon-multi-date-picker.component';

@NgModule({
  declarations: [IconMultiDatePickerComponent],
  imports: [
    CommonModule,
    CalendarModule,
    ButtonModule,
    FeatherModule.pick({ Calendar }),
  ],
  exports: [IconMultiDatePickerComponent],
})
export class IconMultiDatePickerModule {}
