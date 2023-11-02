import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FeatherModule } from 'angular-feather';
import { ThumbsUp } from 'angular-feather/icons';
import { AgGridModule } from '@ag-grid-community/angular';
import { ButtonAllModule, ChipListModule } from '@syncfusion/ej2-angular-buttons';

import { GridPaginationModule } from '@shared/components/grid/grid-pagination/grid-pagination.module';
import { ChipsCssClassPipeModule } from "@shared/pipes/chip-css-class/chip-css-class-pipe.module";
import { JobGridComponent } from './job-grid.component';
import { LikeActionComponent } from './like-action/like-action.component';
import { OpenJobStatusComponent } from './open-job-status/open-job-status/open-job-status.component';

@NgModule({
    declarations: [
      JobGridComponent,
      LikeActionComponent,
      OpenJobStatusComponent,
    ],
    exports: [
      JobGridComponent,
    ],
    imports: [
      CommonModule,
      AgGridModule,
      GridPaginationModule,
      ButtonAllModule,
      ChipListModule,
      ChipsCssClassPipeModule,
      FeatherModule.pick({ ThumbsUp }),
    ],
})
export class JobGridModule {}
