import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  TooltipGridCellComponent,
} from '@client/order-management-irp/components/tooltip-grid-cell/tooltip-grid-cell.component';
import { TooltipModule } from '@syncfusion/ej2-angular-popups';

@NgModule({
  declarations: [TooltipGridCellComponent],
  imports: [CommonModule, TooltipModule],
  exports: [TooltipGridCellComponent],
})
export class TooltipGridCellModule {}
