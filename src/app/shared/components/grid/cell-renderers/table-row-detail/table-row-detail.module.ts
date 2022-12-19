import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GridModule } from '@shared/components/grid/grid.module';
import { TableRowDetailComponent } from '@shared/components/grid/cell-renderers/table-row-detail/table-row-detail.component';

@NgModule({
  declarations: [TableRowDetailComponent],
  imports: [CommonModule, GridModule],
  exports: [TableRowDetailComponent],
})
export class TableRowDetailModule {}
