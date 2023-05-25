import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { FeatherModule } from "angular-feather";
import { GridModule } from "@syncfusion/ej2-angular-grids";
import { ButtonModule, ChipListModule } from "@syncfusion/ej2-angular-buttons";

import { OrderReOrdersContainerComponent } from "./order-reorders-container.component";
import { GridPaginationModule } from "../grid/grid-pagination/grid-pagination.module";
import { OrderReOrdersListComponent } from "./components/order-reorders-list/order-re-orders-list.component";
import { OrderCloseReasonInfoModule } from "../order-close-reason-info/order-close-reason-info.module";
import { GeneralOrderPerDiemInfoModule } from "../general-order-per-diem-info/general-order-per-diem-info.module";
import { ChipsCssClassPipeModule } from "@shared/pipes/chip-css-class/chip-css-class-pipe.module";

@NgModule({
  declarations: [OrderReOrdersContainerComponent, OrderReOrdersListComponent],
  exports: [OrderReOrdersContainerComponent],
  imports: [
    CommonModule,
    GridPaginationModule,
    OrderCloseReasonInfoModule,
    GeneralOrderPerDiemInfoModule,
    ChipsCssClassPipeModule,
    FeatherModule,
    ChipListModule,
    ButtonModule,
    GridModule,
  ],
})
export class OrderReOrdersContainerModule { }
