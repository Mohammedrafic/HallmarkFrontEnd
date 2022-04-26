import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { GridModule, ResizeService, PagerModule, PageService } from '@syncfusion/ej2-angular-grids';
import { ButtonModule, ChipListModule, CheckBoxModule, RadioButtonModule  } from '@syncfusion/ej2-angular-buttons';
import { DropDownListModule, ListBoxModule } from '@syncfusion/ej2-angular-dropdowns';
import { UploaderModule, TextBoxModule, NumericTextBoxModule } from '@syncfusion/ej2-angular-inputs';
import { SidebarModule } from '@syncfusion/ej2-angular-navigations';
import { DatePickerModule } from '@syncfusion/ej2-angular-calendars';
import { DialogModule } from '@syncfusion/ej2-angular-popups';
import { ToastModule } from '@syncfusion/ej2-angular-notifications';
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
  Plus,
  AlertCircle,
  Edit3
} from 'angular-feather/icons';

import { ClientManagementContentComponent } from './client-management/client-management-content/client-management-content.component';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { AddEditOrganizationComponent } from './client-management/add-edit-organization/add-edit-organization.component';
import { NgxsModule } from '@ngxs/store';
import { AdminState } from './store/admin.state';
import { SharedModule } from '../shared/shared.module';
import { OrganizationManagementContentComponent } from './organization-management/organization-management-content/organization-management-content.component';
import { DepartmentsComponent } from './organization-management/organization-management-content/departments/departments.component';

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
  Plus,
  AlertCircle,
  Edit3
};
@NgModule({
  declarations: [
    ClientManagementContentComponent,
    AddEditOrganizationComponent,
    AdminComponent,
    OrganizationManagementContentComponent,
    DepartmentsComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    ListBoxModule,
    PagerModule,
    GridModule,
    ButtonModule,
    ChipListModule,
    DropDownListModule,
    CheckBoxModule,
    UploaderModule,
    RadioButtonModule,
    TextBoxModule,
    NumericTextBoxModule,
    SidebarModule,
    DatePickerModule,
    DialogModule,

    FeatherModule.pick(sidebarIcons),

    //STORE
    NgxsModule.forFeature([
      AdminState
    ]),
  ],
  providers: [
    ResizeService,
    PageService
  ]
})
export class AdminModule { }
