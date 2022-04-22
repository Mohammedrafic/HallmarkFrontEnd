import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GridModule, ResizeService, PagerModule, PageService } from '@syncfusion/ej2-angular-grids';
import { ButtonModule, ChipListModule, CheckBoxModule, RadioButtonModule  } from '@syncfusion/ej2-angular-buttons';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { UploaderModule, TextBoxModule, NumericTextBoxModule } from '@syncfusion/ej2-angular-inputs';

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
  Plus,
  AlertCircle,
  Edit3
} from 'angular-feather/icons';
import { AddEditOrganizationComponent } from './client-management/add-edit-organization/add-edit-organization.component';
import { NgxsModule } from '@ngxs/store';
import { AdminState } from './store/admin.state';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ValidationErrorPipe } from '../shared/pipes/validation-error.pipe';

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
    ValidationErrorPipe
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    FormsModule, ReactiveFormsModule,

    GridModule,
    ButtonModule,
    ChipListModule,
    DropDownListModule,
    CheckBoxModule,
    UploaderModule,
    RadioButtonModule,
    TextBoxModule,
    NumericTextBoxModule,
    PagerModule,

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
