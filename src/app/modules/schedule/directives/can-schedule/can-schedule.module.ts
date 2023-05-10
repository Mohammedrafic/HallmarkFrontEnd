import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CanScheduleDirective } from './can-schedule.directive';

@NgModule({
  declarations: [
    CanScheduleDirective,
  ],
  exports: [
    CanScheduleDirective,
  ],
  imports: [
    CommonModule,
  ],
})
export class CanScheduleModule { }
