import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FeatherModule } from 'angular-feather';
import { ThumbsUp } from 'angular-feather/icons';
import { AgGridModule } from '@ag-grid-community/angular';
import { ButtonAllModule } from '@syncfusion/ej2-angular-buttons';

import { GridPaginationModule } from '@shared/components/grid/grid-pagination/grid-pagination.module';
import { JobGridComponent } from './job-grid.component';
import { LikeActionComponent } from './like-action/like-action.component';

@NgModule({
  declarations: [
    JobGridComponent,
    LikeActionComponent,
  ],
  exports: [
    JobGridComponent,
  ],
  imports: [
    CommonModule,
    AgGridModule,
    GridPaginationModule,
    ButtonAllModule,
    FeatherModule.pick({ ThumbsUp }),
  ],
})
export class JobGridModule {}
