import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Sliders } from 'angular-feather/icons';
import { DashboardControlComponent } from './dashboard-control.component';
import { FeatherModule } from 'angular-feather';
import { ButtonModule } from '@syncfusion/ej2-angular-buttons';
import { GridModule } from '@syncfusion/ej2-angular-grids';
import { WidgetListComponent } from './components/widget-list/widget-list.component';
import { DialogModule } from '@syncfusion/ej2-angular-popups';
import { SharedModule } from '@shared/shared.module';
import { InlineLoaderModule } from '@shared/components/inline-loader/inline-loader.module';

@NgModule({
  declarations: [DashboardControlComponent, WidgetListComponent],
  imports: [
    CommonModule,
    ButtonModule,
    GridModule,
    DialogModule,
    SharedModule,
    FeatherModule.pick({ Sliders }),
    InlineLoaderModule,
  ],
  exports: [DashboardControlComponent],
})
export class DashboardControlModule {}
