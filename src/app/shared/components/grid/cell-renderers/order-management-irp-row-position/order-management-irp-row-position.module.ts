import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChipListModule } from '@syncfusion/ej2-angular-buttons';
import { SharedModule } from '@shared/shared.module';
import {
  OrderManagementIrpRowPositionComponent,
} from '@shared/components/grid/cell-renderers/order-management-irp-row-position/order-management-irp-row-position.component';
import { TooltipContainerModule } from '@shared/components/tooltip-container/tooltip.module';
import { OrderManagementIRPRowPositionService } from './order-management-irp-row-position.service';

@NgModule({
  declarations: [OrderManagementIrpRowPositionComponent],
  imports: [CommonModule, ChipListModule, SharedModule, TooltipContainerModule],
  exports: [OrderManagementIrpRowPositionComponent],
  providers : [OrderManagementIRPRowPositionService]
})
export class OrderManagementIrpRowPositionModule {}
