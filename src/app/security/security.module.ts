import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from '@shared/shared.module';

import { Sliders, Edit, Trash2 } from 'angular-feather/icons';
import { ButtonAllModule, SwitchAllModule } from '@syncfusion/ej2-angular-buttons';
import { TreeViewAllModule } from '@syncfusion/ej2-angular-navigations';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { GridAllModule, PagerAllModule } from '@syncfusion/ej2-angular-grids';
import { NumericTextBoxAllModule } from '@syncfusion/ej2-angular-inputs';
import { FeatherModule } from 'angular-feather';

import { SecurityRoutingModule } from './security-routing.module';
import { RolesAndPermissionsComponent } from './roles-and-permissions/roles-and-permissions.component';
import { SecurityComponent } from './security.component';
import { RolesGridComponent } from './roles-and-permissions/roles-grid/roles-grid.component';
import { RoleFormComponent } from './roles-and-permissions/role-form/role-form.component';

const scurityIcons = {
  Sliders,
  Edit,
  Trash2
};

@NgModule({
  declarations: [
    SecurityComponent,
    RolesAndPermissionsComponent,
    RolesGridComponent,
    RoleFormComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    SecurityRoutingModule,
    ReactiveFormsModule,

    ButtonAllModule,
    DropDownListModule,
    GridAllModule,
    NumericTextBoxAllModule,
    PagerAllModule,
    SwitchAllModule,
    TreeViewAllModule,

    FeatherModule.pick(scurityIcons),
  ]
})
export class SecurityModule { }
