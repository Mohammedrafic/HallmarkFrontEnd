import { AgGridModule } from '@ag-grid-community/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ButtonModule, CheckBoxModule } from '@syncfusion/ej2-angular-buttons';
import { DatePickerModule } from '@syncfusion/ej2-angular-calendars';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { NumericTextBoxModule } from '@syncfusion/ej2-angular-inputs';
import { TabAllModule, TabModule } from '@syncfusion/ej2-angular-navigations';
import { DropDownButtonModule } from '@syncfusion/ej2-angular-splitbuttons';
import { FeatherModule } from 'angular-feather';
import { Edit, Trash2 } from 'angular-feather/icons';

import { TooltipContainerModule } from '@shared/components/tooltip-container/tooltip.module';
import { SharedModule } from '@shared/shared.module';

import { ProjectMappingComponent } from './components/project-mapping/project-mapping.component';
import { PurchaseOrderMappingComponent } from './components/purchase-order-mapping/purchase-order-mapping.component';
import { PurchaseOrdersComponent } from './components/purchase-orders/purchase-orders.component';
import { SpecialProjectTableComponent } from './components/special-project-table/special-project-table.component';
import { SpecialProjectsComponent } from './components/special-projects/special-projects.component';
import { SpecialProjectContainerComponent } from './components/specialproject-container.component';
import { SpecialprojectRoutingModule } from './specialproject-routing.module';
import {
  SpecialProjectCategoryComponent,
} from './components/special-project-categories/special-project-categories.component';

const icons = {
  Edit,
  Trash2,
};

@NgModule({
  declarations: [
    SpecialProjectContainerComponent,
    SpecialProjectsComponent,
    SpecialProjectTableComponent,
    SpecialProjectCategoryComponent,
    PurchaseOrdersComponent,
    PurchaseOrderMappingComponent,
    ProjectMappingComponent,
  ],
  imports: [
    CommonModule,
    SpecialprojectRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    ButtonModule,
    DropDownListModule,
    CheckBoxModule,
    NumericTextBoxModule,
    DatePickerModule,
    TabModule,
    TabAllModule,
    DropDownButtonModule,
    AgGridModule,
    TooltipContainerModule,
    FeatherModule.pick(icons),
  ],
})
export class SpecialprojectModule { }
