import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AgGridModule } from '@ag-grid-community/angular';

import { GridComponent } from './grid.component';
import { GridPaginationModule } from '@shared/components/grid/grid-pagination/grid-pagination.module';
import { TitleValueCellRendererComponent } from './components/title-value-cell-renderer/title-value-cell-renderer.component';
import { GridCellLinkComponent } from './components/grid-cell-link/grid-cell-link.component';
import { RouterModule } from '@angular/router';
import { ButtonModule } from '@syncfusion/ej2-angular-buttons';

@NgModule({
  declarations: [GridComponent, TitleValueCellRendererComponent, GridCellLinkComponent],
  imports: [CommonModule, AgGridModule, GridPaginationModule, RouterModule, ButtonModule],
  exports: [GridComponent]
})
export class GridModule {}
