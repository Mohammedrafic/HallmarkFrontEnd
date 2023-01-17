import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ButtonModule } from "@syncfusion/ej2-angular-buttons";
import { FeatherModule } from "angular-feather";
import { Sliders } from "angular-feather/icons";

import { SharedModule } from '@shared/shared.module';

import { ScheduleContainerComponent } from './containers/schedule-container/schedule-container.component';
import { ScheduleRoutingModule } from './schedule-routing.module';
import { ScheduleFiltersModule } from './components/schedule-filters/schedule-filters.module';
import { ScheduleGridModule } from './components/schedule-grid/schedule-grid.module';
import { ScheduleApiService } from './services';

const icons = { Sliders };

@NgModule({
  declarations: [ScheduleContainerComponent],
  imports: [
    CommonModule,
    ScheduleRoutingModule,
    SharedModule,
    ScheduleFiltersModule,
    ScheduleGridModule,
    FeatherModule.pick(icons),
    ButtonModule,
  ],
  providers: [ScheduleApiService],
})
export class ScheduleModule {}
