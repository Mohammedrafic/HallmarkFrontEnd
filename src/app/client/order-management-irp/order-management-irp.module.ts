import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { OrderManagementIrpComponent } from '@client/order-management-irp/order-management-irp.component';
import { PageToolbarModule } from '@shared/components/page-toolbar/page-toolbar.module';
import { ButtonModule } from '@syncfusion/ej2-angular-buttons';
import { FeatherModule } from 'angular-feather';
import {
  Download,
  Search,
  Sliders,
  Upload,
  Clipboard,
  Calendar,
  Lock,
  MoreVertical,
  MessageSquare,
} from 'angular-feather/icons';
import { TooltipContainerModule } from '@shared/components/tooltip-container/tooltip.module';
import { DropDownButtonModule } from '@syncfusion/ej2-angular-splitbuttons';
import { SharedModule } from '@shared/shared.module';
import { ButtonGroupModule } from '@shared/components/button-group/button-group.module';
import { AgGridModule } from '@ag-grid-community/angular';
import { GridPaginationModule } from '@shared/components/grid/grid-pagination/grid-pagination.module';
import { TooltipGridCellModule } from '@client/order-management-irp/components/tooltip-grid-cell/tooltip-grid-cell.module';
import {
  GridHeaderActionsModule,
} from '@shared/components/grid/cell-renderers/grid-header-actions/grid-header-actions.module';
import { TableRowDetailsModule } from '@shared/components/grid/cell-renderers/table-row-details/table-row-details.module';
import { GridModule } from '@shared/components/grid/grid.module';

const icons = {
  Sliders,
  Upload,
  Download,
  Search,
  Clipboard,
  Calendar,
  MessageSquare,
  Lock,
  MoreVertical,
};

const routes: Routes = [
  {
    path: '',
    component: OrderManagementIrpComponent,
  },
];

@NgModule({
  declarations: [
    OrderManagementIrpComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
    PageToolbarModule,
    ButtonModule,
    FeatherModule.pick(icons),
    TooltipContainerModule,
    DropDownButtonModule,
    ButtonGroupModule,
    AgGridModule,
    GridPaginationModule,
    TooltipGridCellModule,
    GridHeaderActionsModule,
    TableRowDetailsModule,
    GridModule
  ],
  providers: [],
})
export class OrderManagementIrpModule {}
