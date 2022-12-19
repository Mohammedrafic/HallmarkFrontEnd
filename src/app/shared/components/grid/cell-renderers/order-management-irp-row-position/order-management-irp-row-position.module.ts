import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChipListModule } from '@syncfusion/ej2-angular-buttons';
import { SharedModule } from '@shared/shared.module';
import {
  OrderManagementIrpRowPositionComponent,
} from '@shared/components/grid/cell-renderers/order-management-irp-row-position/order-management-irp-row-position.component';

@NgModule({
  declarations: [OrderManagementIrpRowPositionComponent],
  imports: [CommonModule, ChipListModule, SharedModule],
  exports: [OrderManagementIrpRowPositionComponent],
})
export class OrderManagementIrpRowPositionModule {}
