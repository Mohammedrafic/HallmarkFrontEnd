import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AgGridModule } from '@ag-grid-community/angular';

import { GridPaginationModule } from '@shared/components/grid/grid-pagination/grid-pagination.module';

import { EmployeeCredentialsGridComponent } from './employee-credentials-grid.component';

@NgModule({
  declarations: [EmployeeCredentialsGridComponent],
  imports: [
    CommonModule,
    AgGridModule,
    GridPaginationModule,
  ],
  exports: [
    EmployeeCredentialsGridComponent,
  ],
})
export class EmployeeCredentialsGridModule { }
