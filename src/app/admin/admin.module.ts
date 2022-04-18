import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GridModule, ResizeService } from '@syncfusion/ej2-angular-grids';
import { ButtonModule, ChipListModule, CheckBoxModule, RadioButtonModule  } from '@syncfusion/ej2-angular-buttons';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { UploaderModule, TextBoxModule } from '@syncfusion/ej2-angular-inputs';

import { ClientManagementContentComponent } from './client-management/client-management-content/client-management-content.component';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { FeatherModule } from 'angular-feather';
import {
  Download,
  Upload,
  Sliders,
  Edit,
  Trash2,
  AlignJustify,
  Menu,
  FileText,
  MapPin,
  Plus
} from 'angular-feather/icons';
import { AddEditOrganizationComponent } from './client-management/add-edit-organization/add-edit-organization.component';

const sidebarIcons = {
  Download,
  Upload,
  Sliders,
  Edit,
  Trash2,
  AlignJustify,
  Menu,
  FileText,
  MapPin,
  Plus
};
@NgModule({
  declarations: [
    ClientManagementContentComponent,
    AddEditOrganizationComponent,
    AdminComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,

    GridModule,
    ButtonModule,
    ChipListModule,
    DropDownListModule,
    CheckBoxModule,
    UploaderModule,
    RadioButtonModule,
    TextBoxModule,

    FeatherModule.pick(sidebarIcons)
  ],
  providers: [
    ResizeService
  ]
})
export class AdminModule { }
