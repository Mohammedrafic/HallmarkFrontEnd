import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReOpenOrderService } from '@client/order-management/reopen-order/reopen-order.service';

@NgModule({
  declarations: [],
  providers: [ReOpenOrderService],
  imports: [CommonModule],
  exports: [],
})
export class ReopenOrderModule {}
