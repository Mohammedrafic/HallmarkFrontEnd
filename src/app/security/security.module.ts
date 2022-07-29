import { ModuleRegistry } from '@ag-grid-enterprise/all-modules';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { MultiselectDropdownModule } from "@shared/components/form-controls/multiselect-dropdown/multiselect-dropdown.module";
import { SharedModule } from '@shared/shared.module';
import { DialogModule } from '@syncfusion/ej2-angular-popups';
import { Sliders, Edit, Trash2, Plus } from 'angular-feather/icons';
import { ButtonAllModule, ChipListModule, SwitchAllModule } from '@syncfusion/ej2-angular-buttons';
import { TabAllModule, TreeViewAllModule } from '@syncfusion/ej2-angular-navigations';
import { DropDownListModule, MultiSelectAllModule } from '@syncfusion/ej2-angular-dropdowns';
import { GridAllModule, PagerAllModule } from '@syncfusion/ej2-angular-grids';
import { MaskedTextBoxModule, NumericTextBoxAllModule } from '@syncfusion/ej2-angular-inputs';
import { FeatherModule } from 'angular-feather';

import { SecurityRoutingModule } from './security-routing.module';
import { RolesAndPermissionsComponent } from './roles-and-permissions/roles-and-permissions.component';
import { SecurityComponent } from './security.component';
import { RolesGridComponent } from './roles-and-permissions/roles-grid/roles-grid.component';
import { RoleFormComponent } from './roles-and-permissions/role-form/role-form.component';
import { UserListComponent } from './user-list/user-list.component';
import { UserGridComponent } from './user-list/user-grid/user-grid.component';
import { AddEditUserComponent } from './user-list/add-edit-user/add-edit-user.component';
import { UserSettingsComponent } from './user-list/add-edit-user/user-settings/user-settings.component';
import { VisibilitySettingsComponent } from './user-list/add-edit-user/visibility-settings/visibility-settings.component';
import { AddEditVisibilityComponent } from './user-list/add-edit-user/visibility-settings/add-edit-visibility/add-edit-visibility.component';
import { DropDownButtonModule } from '@syncfusion/ej2-angular-splitbuttons';
import { AgGridModule } from '@ag-grid-community/angular';
import { RolesFiltersComponent } from './roles-and-permissions/roles-grid/roles-filters/roles-filters.component';

const scurityIcons = {
  Sliders,
  Edit,
  Plus,
  Trash2,
};

@NgModule({
  declarations: [
    SecurityComponent,
    RolesAndPermissionsComponent,
    RolesGridComponent,
    RoleFormComponent,
    UserListComponent,
    UserGridComponent,
    AddEditUserComponent,
    UserSettingsComponent,
    VisibilitySettingsComponent,
    AddEditVisibilityComponent,
    RolesFiltersComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    SecurityRoutingModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonAllModule,
    DropDownListModule,
    GridAllModule,
    NumericTextBoxAllModule,
    PagerAllModule,
    SwitchAllModule,
    TreeViewAllModule,
    TabAllModule,
    MaskedTextBoxModule,
    MultiSelectAllModule,
    ChipListModule,
    AgGridModule,
    DropDownButtonModule,
    MultiselectDropdownModule,

    FeatherModule.pick(scurityIcons),
  ],
})
export class SecurityModule {}
