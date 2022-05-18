import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { GridModule, ResizeService, PagerModule, PageService } from '@syncfusion/ej2-angular-grids';
import { ButtonModule, ChipListModule, CheckBoxModule, RadioButtonModule, SwitchModule } from '@syncfusion/ej2-angular-buttons';
import { DropDownListModule, ListBoxModule, MultiSelectAllModule } from '@syncfusion/ej2-angular-dropdowns';
import { UploaderModule, TextBoxModule, NumericTextBoxModule } from '@syncfusion/ej2-angular-inputs';
import { SidebarModule, TabModule, TabAllModule } from '@syncfusion/ej2-angular-navigations';
import { DatePickerModule, TimePickerModule, DateTimePickerModule } from '@syncfusion/ej2-angular-calendars';
import { DialogModule } from '@syncfusion/ej2-angular-popups';
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
  Edit3,
  ChevronDown,
  ChevronRight,
  Copy
} from 'angular-feather/icons';

import { NgxsModule } from '@ngxs/store';
import { OrganizationManagementState } from './store/organization-management.state';
import { SharedModule } from '../shared/shared.module';
import { ShiftsState } from './store/shifts.state';
import { OrganizationManagementComponent } from './organization-management.component';
import { OrganizationManagementRoutingModule } from './organization-management-routing.module';
import { DepartmentsComponent } from './departments/departments.component';
import { LocationsComponent } from './locations/locations.component';
import { CredentialsSetupComponent } from './credentials/credentials-setup/credentials-setup.component';
import { SkillsComponent } from './skills/skills.component';
import { ShiftsComponent } from './shifts/shifts.component';
import { GroupSetupComponent } from './credentials/credentials-setup/group-setup/group-setup.component';
import { SettingsComponent } from './settings/settings.component';
import { CredentialsComponent } from './credentials/credentials.component';
import { CredentialsListComponent } from './credentials/credentials-list/credentials-list.component';
import { GroupMappingComponent } from './credentials/credentials-setup/group-mapping/group-mapping.component';
import { GroupComponent } from './credentials/credentials-setup/group/group.component';

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
  Edit3,
  ChevronDown,
  ChevronRight,
  Copy
};
@NgModule({
  declarations: [
    OrganizationManagementComponent,
    DepartmentsComponent,
    LocationsComponent,
    CredentialsSetupComponent,
    CredentialsComponent,
    CredentialsListComponent,
    SkillsComponent,
    ShiftsComponent,
    GroupSetupComponent,
    SettingsComponent,
    GroupMappingComponent,
    GroupComponent,
  ],
  imports: [
    CommonModule,
    OrganizationManagementRoutingModule,
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
    TabModule,
    TabAllModule,
    TimePickerModule,
    DateTimePickerModule,
    MultiSelectAllModule,
    SwitchModule,
    MultiSelectAllModule,

    FeatherModule.pick(sidebarIcons),

    //STORE
    NgxsModule.forFeature([
      OrganizationManagementState,
      ShiftsState
    ]),
  ],
  providers: [
    ResizeService,
    PageService
  ]
})
export class OrganizationManagementModule { }
