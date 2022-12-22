import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '@shared/shared.module';

import { ScheduleGridComponent } from './schedule-grid.component';
import { FeatherModule } from 'angular-feather';
import { Search } from 'angular-feather/icons';
import { ButtonModule } from '@syncfusion/ej2-angular-buttons';

const icons = {
  Search,
};

@NgModule({
  declarations: [
    ScheduleGridComponent,
  ],
  imports: [
    CommonModule,
    FeatherModule.pick(icons),
    SharedModule,
    ButtonModule
  ],
  exports: [ScheduleGridComponent],
})
export class ScheduleGridModule { }
