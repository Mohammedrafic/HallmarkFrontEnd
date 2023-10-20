import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FeatherModule } from 'angular-feather';
import { AgGridModule } from '@ag-grid-community/angular';
import { ButtonModule } from '@syncfusion/ej2-angular-buttons';

import { GridPaginationModule } from '@shared/components/grid/grid-pagination/grid-pagination.module';
import { ActionCellComponent } from './action-cell/action-cell.component';
import { CancelEmployeeComponent } from './cancel-employee.component';


@NgModule({
  declarations: [
    CancelEmployeeComponent,
    ActionCellComponent
  ],
  exports: [
    CancelEmployeeComponent
  ],
  imports: [
    CommonModule,
    AgGridModule,
    GridPaginationModule,
    ButtonModule,
    FeatherModule
  ]
})
export class CancelEmployeeModule {}
