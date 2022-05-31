import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FeatherModule } from 'angular-feather';
import { Edit, Plus } from 'angular-feather/icons';

import {
  ColumnMenuService,
  EditService,
  FilterService,
  GridModule,
  GroupService,
  PagerModule,
  PageService,
  ResizeService,
  SortService,
  ToolbarService
} from '@syncfusion/ej2-angular-grids';
import { ButtonModule, CheckBoxModule } from '@syncfusion/ej2-angular-buttons';
import { NumericTextBoxModule, TextBoxModule } from '@syncfusion/ej2-angular-inputs';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';

import { SharedModule } from '@shared/shared.module';

import { OrderCredentialsComponent } from './order-credentials.component';
import { AddOrderCredentialFormComponent } from './components/add-order-credential-form/add-order-credential-form.component';
import { EditOrderCredentialFormComponent } from './components/edit-order-credential-form/edit-order-credential-form.component';
import { OrderCredentialsGridComponent } from './components/order-credentials-grid/order-credentials-grid.component';

const icons = {
  Edit,
  Plus
};

@NgModule({
  declarations: [
    OrderCredentialsComponent,
    AddOrderCredentialFormComponent,
    EditOrderCredentialFormComponent,
    OrderCredentialsGridComponent
  ],
  imports: [
    ButtonModule,
    CheckBoxModule,
    CommonModule,
    DropDownListModule,
    FeatherModule.pick(icons),
    GridModule,
    NumericTextBoxModule,
    PagerModule,
    SharedModule,
    TextBoxModule
  ],
  providers: [
    ColumnMenuService,
    EditService,
    FilterService,
    GroupService,
    PageService,
    ResizeService,
    SortService,
    ToolbarService
  ],
  exports: [
    OrderCredentialsComponent
  ]
})
export class OrderCredentialsModule { }
