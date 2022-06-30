import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AgGridModule } from '@ag-grid-community/angular';

import { GridComponent } from './grid.component';
import { GridPaginationModule } from '@shared/components/grid/grid-pagination/grid-pagination.module';

@NgModule({
  declarations: [GridComponent],
  imports: [CommonModule, AgGridModule, GridPaginationModule],
  exports: [GridComponent],
})
export class GridModule {}
