import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { OrderCloseReasonInfoComponent } from "./order-close-reason-info.component";

@NgModule({
  declarations: [OrderCloseReasonInfoComponent],
  exports: [OrderCloseReasonInfoComponent],
  imports: [CommonModule],
})
export class OrderCloseReasonInfoModule { }
