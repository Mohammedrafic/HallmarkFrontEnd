import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  TableRowDetailsComponent,
} from '@shared/components/grid/cell-renderers/table-row-details/table-row-details.component';
import { GridModule } from '@shared/components/grid/grid.module';

@NgModule({
  declarations: [TableRowDetailsComponent],
  imports: [CommonModule, GridModule],
  exports: [TableRowDetailsComponent],
})
export class TableRowDetailsModule {}
