import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ButtonModule } from '@syncfusion/ej2-angular-buttons';
import { FeatherModule } from 'angular-feather';
import { Sliders } from 'angular-feather/icons';

import { InlineChipsModule } from '@shared/components/inline-chips';
import { TooltipContainerModule } from '@shared/components/tooltip-container/tooltip.module';
import { SharedModule } from '@shared/shared.module';
import { EditScheduleModule } from './components/edit-schedule/edit-schedule.module';
import { ScheduleFiltersModule } from './components/schedule-filters/schedule-filters.module';
import { ScheduleGridModule } from './components/schedule-grid/schedule-grid.module';
import { ScheduleContainerComponent } from './containers/schedule-container/schedule-container.component';
import { ScheduleRoutingModule } from './schedule-routing.module';
import { CreateScheduleService, ScheduleApiService, ScheduleFiltersService } from './services';
import { CreateScheduleModule } from './components/create-schedule/create-schedule.module';

const icons = { Sliders };

@NgModule({
  declarations: [ScheduleContainerComponent],
  imports: [
    CommonModule,
    ScheduleRoutingModule,
    SharedModule,
    ScheduleFiltersModule,
    ScheduleGridModule,
    CreateScheduleModule,
    EditScheduleModule,
    FeatherModule.pick(icons),
    ButtonModule,
    TooltipContainerModule,
    InlineChipsModule,
  ],
  providers: [
    ScheduleApiService,
    ScheduleFiltersService,
    CreateScheduleService,
  ],
})
export class ScheduleModule {}
