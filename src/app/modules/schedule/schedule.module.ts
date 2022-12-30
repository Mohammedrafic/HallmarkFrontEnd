import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '@shared/shared.module';

import { ScheduleContainerComponent } from './containers/schedule-container/schedule-container.component';
import { ScheduleRoutingModule } from './schedule-routing.module';
import { ScheduleFiltersModule } from './components/schedule-filters/schedule-filters.module';
import { ScheduleGridModule } from './components/schedule-grid/schedule-grid.module';
import { ScheduleApiService } from '@shared/services/schedule-api.service';

@NgModule({
  declarations: [ScheduleContainerComponent],
  imports: [
    CommonModule,
    ScheduleRoutingModule,
    SharedModule,
    ScheduleFiltersModule,
    ScheduleGridModule,
  ],
  providers: [ScheduleApiService],
})
export class ScheduleModule {}
