import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { GridModule, ResizeService, PagerModule, PageService } from '@syncfusion/ej2-angular-grids';
import { ButtonModule, ChipListModule, CheckBoxModule, RadioButtonModule, SwitchModule } from '@syncfusion/ej2-angular-buttons';
import { DropDownListModule, ListBoxModule, MultiSelectAllModule, AutoCompleteModule } from '@syncfusion/ej2-angular-dropdowns';
import {
  UploaderModule,
  TextBoxModule,
  NumericTextBoxModule,
  MaskedTextBoxModule
} from '@syncfusion/ej2-angular-inputs';
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
  Copy,
  Search
} from 'angular-feather/icons';

import { NgxsModule } from '@ngxs/store';
import { OrganizationManagementState } from './store/organization-management.state';
import { CredentialsState } from './store/credentials.state';
import { SharedModule } from '@shared/shared.module';
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
import { GroupComponent } from './credentials/credentials-setup/group/group.component';
import { HolidaysState } from './store/holidays.state';
import { HolidaysComponent } from './holidays/holidays.component';
import { JobOrderComponent } from './workflow/job-order/job-order.component';
import { WorkflowMappingComponent } from './workflow/workflow-mapping/workflow-mapping.component';
import { DropDownButtonModule } from '@syncfusion/ej2-angular-splitbuttons';
import { CardMenuComponent } from './workflow/job-order/card-menu/card-menu.component';
import { WorkflowStepsComponent } from './workflow/job-order/workflow-steps/workflow-steps.component';
import { WorkflowState } from './store/workflow.state';
import { BillRatesComponent } from './bill-rates/bill-rates.component';
import { BillRateSetupComponent } from './bill-rates/bill-rate-setup/bill-rate-setup.component';
import { BillRateTypeComponent } from './bill-rates/bill-rate-type/bill-rate-type.component';
import { BillRateTypeMappingComponent } from './bill-rates/bill-rate-type-mapping/bill-rate-type-mapping.component';
import { BillRatesState } from '@organization-management/store/bill-rates.state';
import { RejectReasonComponent } from './reject-reason/reject-reason.component';
import { RejectReasonState } from "@organization-management/store/reject-reason.state";
import { FilteredCredentialsComponent } from './credentials/credentials-setup/filtered-credentials/filtered-credentials.component';
import { MapCredentialsFormComponent } from './credentials/credentials-setup/map-credentials-form/map-credentials-form.component';

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
  Copy,
  Search
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
    GroupComponent,
    HolidaysComponent,
    JobOrderComponent,
    WorkflowMappingComponent,
    CardMenuComponent,
    WorkflowStepsComponent,
    BillRatesComponent,
    BillRateSetupComponent,
    BillRateTypeComponent,
    BillRateTypeMappingComponent,
    RejectReasonComponent,
    FilteredCredentialsComponent,
    MapCredentialsFormComponent
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
    AutoCompleteModule,
    DropDownButtonModule,
    MaskedTextBoxModule,

    FeatherModule.pick(sidebarIcons),

    //STORE
    NgxsModule.forFeature([
      OrganizationManagementState,
      WorkflowState,
      CredentialsState,
      ShiftsState,
      HolidaysState,
      BillRatesState,
      RejectReasonState
    ]),
  ],
  providers: [
    ResizeService,
    PageService
  ]
})
export class OrganizationManagementModule { }
