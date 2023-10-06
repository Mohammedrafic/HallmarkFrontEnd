import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeatherModule } from 'angular-feather';
import { Sliders, Tool } from 'angular-feather/icons';

import { ButtonModule } from '@syncfusion/ej2-angular-buttons';

import { TooltipContainerModule } from "@shared/components/tooltip-container/tooltip.module";
import { SharedModule } from '@shared/shared.module';
import { DashboardControlComponent } from './dashboard-control.component';
import { FilterChipListModule } from './filter-chip-list/filter-chip-list.module';
import { WidgetFilterModule } from './widget-filter/widget-filter.module';
import { QuickOrderModule } from './quick-order/quick-order.module';
import { WidgetListModule } from './widget-list/widget-list.module';


@NgModule({
  declarations: [DashboardControlComponent],
  imports: [
    CommonModule,
    ButtonModule,
    SharedModule,
    FeatherModule.pick({ Sliders, Tool }),
    FilterChipListModule,
    WidgetFilterModule,
    WidgetListModule,
    QuickOrderModule,
    TooltipContainerModule,
  ],
  exports: [DashboardControlComponent],
})
export class DashboardControlModule {}
