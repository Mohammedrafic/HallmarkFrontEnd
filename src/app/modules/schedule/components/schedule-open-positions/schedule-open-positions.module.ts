import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ScheduleOpenPositionsComponent } from './schedule-open-positions.component';
import { OpenPositionService } from '../../services';

@NgModule({
  declarations: [
    ScheduleOpenPositionsComponent,
  ],
  imports: [
    CommonModule,
  ],
  exports: [ScheduleOpenPositionsComponent],
  providers: [OpenPositionService],
})
export class ScheduleOpenPositionsModule { }
