import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TableStatusCellComponent } from '@shared/components/table-status-cell/table-status-cell.component';
import { ChipListModule } from '@syncfusion/ej2-angular-buttons';
import { SharedModule } from '@shared/shared.module';

@NgModule({
  declarations: [TableStatusCellComponent],
  exports: [TableStatusCellComponent],
  imports: [CommonModule, ChipListModule, SharedModule],
})
export class TableStatusCellModule {}
