import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { GridModule, PagerModule, PageService, ResizeService } from '@syncfusion/ej2-angular-grids';
import {
  ButtonModule,
  CheckBoxModule,
  ChipListModule,
  RadioButtonModule,
  SwitchModule,
} from '@syncfusion/ej2-angular-buttons';
import {
  AutoCompleteModule,
  DropDownListModule,
  ListBoxModule,
  MultiSelectAllModule,
} from '@syncfusion/ej2-angular-dropdowns';
import {
  MaskedTextBoxModule,
  NumericTextBoxModule,
  TextBoxModule,
  UploaderModule,
} from '@syncfusion/ej2-angular-inputs';
import { SidebarModule, TabAllModule, TabModule } from '@syncfusion/ej2-angular-navigations';
import { DatePickerModule, DateTimePickerModule, TimePickerModule } from '@syncfusion/ej2-angular-calendars';
import { DialogModule } from '@syncfusion/ej2-angular-popups';
import { FeatherModule } from 'angular-feather';
import {
  AlertCircle,
  AlignJustify,
  ChevronDown,
  ChevronRight,
  Copy,
  Download,
  Edit,
  Edit3,
  FileText,
  MapPin,
  Menu,
  Plus,
  Search,
  Sliders,
  Trash2,
  Upload,
} from 'angular-feather/icons';

import { NgxsModule } from '@ngxs/store';
import { OrganizationManagementState } from './store/organization-management.state';
import { CredentialsState } from './store/credentials.state';
import { SharedModule } from '@shared/shared.module';
import { AgGridModule } from '@ag-grid-community/angular';
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
import { ExternalBillRateComponent } from './bill-rates/external-bill-rate/external-bill-rate.component';
import { BillRateTypeMappingComponent } from './bill-rates/bill-rate-type-mapping/bill-rate-type-mapping.component';
import { BillRatesState } from '@organization-management/store/bill-rates.state';
import { CandidateRejectReasonComponent } from './reasons/reject-reason/candidate-reject-reason.component';
import { FilteredCredentialsComponent } from './credentials/credentials-setup/filtered-credentials/filtered-credentials.component';
import { MapCredentialsFormComponent } from './credentials/credentials-setup/map-credentials-form/map-credentials-form.component';
import { ReasonsComponent } from './reasons/reasons.component';
import { ClosureReasonComponent } from './reasons/closure-reason/closure-reason.component';
import { RegionsComponent } from './regions/regions.component';
import { ManualInvoiceRejectReasonComponent } from './reasons/manual-invoice-reject-reason/manual-invoice-reject-reason.component';
import { OrderRequisitionComponent } from './reasons/order-requisition/order-requisition.component';
import { SpecialProjectContainerComponent } from './specialproject/components/specialproject-container.component';
import { PurchaseOrdersComponent } from './specialproject/components/purchase-orders/purchase-orders.component';
import { SpecialProjectsComponent } from './specialproject/components/special-projects/special-projects.component';
import { SpecialProjectState } from './store/special-project.state';
import { PurchaseOrderState } from './store/purchase-order.state';
import { SpecialProjectCategoryState } from './store/special-project-category.state';
import { SpecialProjectCategoryComponent } from './specialproject/components/special-project-categories/special-project-categories.component';
import { ProjectMappingComponent } from './specialproject/components/project-mapping/project-mapping.component';
import { SpecialProjectTableComponent } from './specialproject/components/special-project-table/special-project-table.component';
import { SpecialProjectMappingState } from './store/special-project-mapping.state';
import { PurchaseOrderMappingComponent } from './specialproject/components/purchase-order-mapping/purchase-order-mapping.component';
import { PurchaseOrderMappingState } from './store/purchase-order-mapping.state';
import { BusinessLinesComponent } from './business-lines/business-lines.component';
import { BusinessLinesState } from './store/business-lines.state';
import { ImportLocationsComponent } from './locations/import-locations/import-locations.component';
import { GridModule as AppGridModule } from '@shared/components/grid/grid.module';
import { ImportDepartmentsComponent } from './departments/import-departments/import-departments.component';
import { ImportBillRatesComponent } from './bill-rates/import-bill-rates/import-bill-rates.component';
import { ImportDialogContentModule } from '@shared/components/import-dialog-content/import-dialog-content.module';
import { CanManageSettingPipe } from '@shared/pipes/can-manage-setting.pipe';

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
  Search,
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
    ExternalBillRateComponent,
    BillRateTypeMappingComponent,
    CandidateRejectReasonComponent,
    FilteredCredentialsComponent,
    MapCredentialsFormComponent,
    ReasonsComponent,
    ManualInvoiceRejectReasonComponent,
    ClosureReasonComponent,
    RegionsComponent,
    OrderRequisitionComponent,
    SpecialProjectContainerComponent,
    PurchaseOrdersComponent,
    SpecialProjectsComponent,
    SpecialProjectCategoryComponent,
    ProjectMappingComponent,
    SpecialProjectTableComponent,
    PurchaseOrderMappingComponent,
    BusinessLinesComponent,
    ImportLocationsComponent,
    ImportDepartmentsComponent,
    ImportBillRatesComponent,
    CanManageSettingPipe
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
    AgGridModule,
    AppGridModule,

    FeatherModule.pick(sidebarIcons),

    //STORE
    NgxsModule.forFeature([
      OrganizationManagementState,
      WorkflowState,
      CredentialsState,
      ShiftsState,
      HolidaysState,
      BillRatesState,
      SpecialProjectState,
      PurchaseOrderState,
      SpecialProjectCategoryState,
      SpecialProjectMappingState,
      PurchaseOrderMappingState,
      BusinessLinesState,
    ]),
    ImportDialogContentModule,
  ],
  exports: [BillRatesComponent],
  providers: [ResizeService, PageService],
})
export class OrganizationManagementModule {}
