import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { ScheduleOpenPositionsComponent } from './schedule-open-positions.component';
import { OpenPositionService } from '../../services';


@NgModule({
  declarations: [
    ScheduleOpenPositionsComponent,
  ],
    imports: [
        CommonModule,
        DragDropModule,
    ],
  exports: [ScheduleOpenPositionsComponent],
  providers: [OpenPositionService],
})
export class ScheduleOpenPositionsModule { }
