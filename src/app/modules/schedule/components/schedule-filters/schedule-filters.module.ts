import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ScheduleFiltersComponent } from './schedule-filters.component';
import { ScheduleFiltersService } from '../../services/schedule-filters.service';

@NgModule({
  declarations: [
    ScheduleFiltersComponent,
  ],
  imports: [
    CommonModule,
  ],
  exports: [ScheduleFiltersComponent],
  providers: [ScheduleFiltersService],
})
export class ScheduleFiltersModule {}
