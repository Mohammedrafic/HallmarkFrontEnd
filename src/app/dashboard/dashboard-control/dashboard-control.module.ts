import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeatherModule } from 'angular-feather';
import { Sliders } from 'angular-feather/icons';

import { ButtonModule } from '@syncfusion/ej2-angular-buttons';

import { DashboardControlComponent } from './dashboard-control.component';
import { SharedModule } from '@shared/shared.module';
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
    FeatherModule.pick({ Sliders }),
    FilterChipListModule,
    WidgetFilterModule,
    WidgetListModule,
    QuickOrderModule
  ],
  exports: [DashboardControlComponent],
})
export class DashboardControlModule {}
