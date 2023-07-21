import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ConfigurationGridComponent } from './configuration-grid.component';
import { GridPaginationModule } from '../grid/grid-pagination/grid-pagination.module';
import { GridModule } from '@syncfusion/ej2-angular-grids';
import {
  Plus,
} from 'angular-feather/icons';
import { FeatherModule } from 'angular-feather';
import { CanManageSettingModule } from '@shared/pipes/can-manage-setting/can-manage-setting.module';
import { ButtonModule } from '@syncfusion/ej2-angular-buttons';

@NgModule({
  imports: [
    CommonModule,
    GridPaginationModule,
    GridModule,
    ButtonModule,
    CanManageSettingModule,
    FeatherModule.pick({Plus}),
  ],
  exports: [ConfigurationGridComponent],
  declarations: [ConfigurationGridComponent],
})
export class ConfigurationGridModule {}
