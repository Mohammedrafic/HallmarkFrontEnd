import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { AccordionModule, TabAllModule } from '@syncfusion/ej2-angular-navigations';
import {
  ButtonModule,
  CheckBoxModule,
  ChipListModule,
  RadioButtonModule,
  SwitchModule,
} from '@syncfusion/ej2-angular-buttons';
import { FeatherModule } from 'angular-feather';
import {
  AlertCircle,
  AlertTriangle,
  AlignJustify,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Copy,
  Download,
  Edit,
  FileText,
  Filter,
  Lock,
  Maximize2,
  Menu,
  MessageSquare,
  Minimize2,
  MoreVertical,
  Plus,
  Search,
  Slash,
  Sliders,
  Trash2,
  Unlock,
  Upload,
  X,
  XCircle,
  Paperclip,
  ArrowUp,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight
} from 'angular-feather/icons';
import {
  MaskedTextBoxModule,
  NumericTextBoxModule,
  TextBoxModule,
  UploaderModule,
} from '@syncfusion/ej2-angular-inputs';
import { DropDownListModule, ListBoxModule, MultiSelectAllModule } from '@syncfusion/ej2-angular-dropdowns';
import { AgencyComponent } from './agency.component';
import { AgencyRoutingModule } from './agency-routing.module';
import { AgencyListComponent } from './agency-list/agency-list.component';
import { AddEditAgencyComponent } from './agency-list/add-edit-agency/add-edit-agency.component';
import { SharedModule } from '@shared/shared.module';
import { GeneralInfoGroupComponent } from './agency-list/add-edit-agency/general-info-group/general-info-group.component';
import { BillingDetailsGroupComponent } from './agency-list/add-edit-agency/billing-details-group/billing-details-group.component';
import { ContactDetailsGroupComponent } from './agency-list/add-edit-agency/contact-details-group/contact-details-group.component';
import { PaymentDetailsGridComponent } from './agency-list/add-edit-agency/payment-details-grid/payment-details-grid.component';
import { GridAllModule, PagerModule } from '@syncfusion/ej2-angular-grids';
import { CandidatesComponent } from './candidates/candidates.component';
import { AddEditCandidateComponent } from './candidates/add-edit-candidate/add-edit-candidate.component';
import { CandidateGeneralInfoComponent } from './candidates/add-edit-candidate/candidate-general-info/candidate-general-info.component';
import { CandidateContactDetailsComponent } from './candidates/add-edit-candidate/candidate-contact-details/candidate-contact-details.component';
import { CandidateProfessionalSummaryComponent } from './candidates/add-edit-candidate/candidate-professional-summary/candidate-professional-summary.component';
import { DatePickerModule } from '@syncfusion/ej2-angular-calendars';
import { NgxsModule } from '@ngxs/store';
import { AgencyState } from './store/agency.state';
import { CandidateState } from './store/candidate.state';
import { DialogAllModule, TooltipModule } from '@syncfusion/ej2-angular-popups';
import { ExperienceGridComponent } from './candidates/add-edit-candidate/experience-grid/experience-grid.component';
import { EducationGridComponent } from './candidates/add-edit-candidate/education-grid/education-grid.component';
import { CredentialsGridComponent } from './candidates/add-edit-candidate/credentials-grid/credentials-grid.component';
import { CandidateAgencyComponent } from './candidates/add-edit-candidate/candidate-agency/candidate-agency.component';
import { OrderManagementComponent } from './order-management/order-management.component';
import { TabNavigationComponent } from './order-management/tab-navigation/tab-navigation.component';
import { OrderManagementGridComponent } from './order-management/order-management-grid/order-management-grid.component';
import { PreviewOrderDialogComponent } from './order-management/order-management-grid/preview-order-dialog/preview-order-dialog.component';
import { FileViewerComponent } from './candidates/add-edit-candidate/file-viewer/file-viewer.component';
import { ProfileComponent } from './profile/profile.component';
import { OrderCandidatesComponent } from '@agency/order-management/order-management-grid/preview-order-dialog/candidates/order-candidates.component';
import { CandidatDialogComponent } from './order-management/order-management-grid/candidat-dialog/candidat-dialog.component';
import { OrderManagementState } from './store/order-management.state';
import { CandidatDetailsComponent } from './order-management/order-management-grid/candidat-dialog/candidat-details/candidat-details.component';
import { NgxMaskModule } from 'ngx-mask';
import { AgencyOrderFiltersComponent } from './order-management/order-management-grid/agency-order-filters/agency-order-filters.component';
import { DropDownButtonModule } from '@syncfusion/ej2-angular-splitbuttons';
import { AddEditReorderModule } from '@client/order-management/components/add-edit-reorder/add-edit-reorder.module';
import { AgencyListFiltersComponent } from './agency-list/agency-list-filters/agency-list-filters.component';
import { ImportCandidatesComponent } from './candidates/import-candidates/import-candidates.component';
import { MultiselectDropdownModule } from '@shared/components/form-controls/multiselect-dropdown/multiselect-dropdown.module';
import { CandidateListModule } from '@shared/components/candidate-list/candidate-list.module';
import { ChildOrderDialogModule } from '@shared/components/child-order-dialog/child-order-dialog.module';
import { CandidateProfileComponent } from './candidates/import-candidates/candidate-profile/candidate-profile.component';
import { GridModule } from '@shared/components/grid/grid.module';
import { CandidateEducationComponent } from './candidates/import-candidates/candidate-education/candidate-education.component';
import { CandidateExperienceComponent } from './candidates/import-candidates/candidate-experience/candidate-experience.component';
import { CandidateDetailsModule } from '@shared/components/candidate-details/candidate-details.module';
import { ExtensionModule } from '@shared/components/extension/extension.module';
import { AssociateListModule } from '@shared/components/associate-list/associate-list.module';
import { CredentialGridService } from "@agency/services/credential-grid.service";
import { ElectronicFormComponent } from './agency-list/add-edit-agency/payment-details-grid/payment-dialog/electronic-form/electronic-form.component';
import { ManualFormComponent } from './agency-list/add-edit-agency/payment-details-grid/payment-dialog/manual-form/manual-form.component';
import { PaymentDialogComponent } from './agency-list/add-edit-agency/payment-details-grid/payment-dialog/payment-dialog.component';
import { JobDistributionComponent } from './agency-list/add-edit-agency/job-distribution/job-distribution.component';
import { OrderMatchColumnComponent } from './candidates/add-edit-candidate/credentials-grid/order-match-column/order-match-column.component';
import { TooltipContainerModule } from '@shared/components/tooltip-container/tooltip.module';
import { CredentialStorageFacadeService } from './services/credential-storage-facade.service';
import { CredentialStorageService } from './services/credential-storage.service';
import { BoolValuePipeModule } from '@shared/pipes/bool-values/bool-values-pipe.module';
import { OrderCandidateApiService } from '@shared/components/order-candidate-list/order-candidate-api.service';
import { CandidateGeneralInfoService } from '@agency/candidates/add-edit-candidate/candidate-general-info/candidate-general-info.service';
import { AgencyNameComponent } from './agency-list/agency-name/agency-name.component';
import { GridPaginationModule } from '@shared/components/grid/grid-pagination/grid-pagination.module';
import { ScrollToTopModule } from '@shared/components/scroll-to-top/scroll-to-top.module';

import { PdfViewerModule } from 'ng2-pdf-viewer';

const sidebarIcons = {
  Sliders,
  Plus,
  Trash2,
  AlertCircle,
  Edit,
  Copy,
  Download,
  Search,
  FileText,
  MessageSquare,
  Lock,
  MoreVertical,
  AlignJustify,
  Menu,
  X,
  Filter,
  Maximize2,
  Minimize2,
  Unlock,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Upload,
  XCircle,
  Slash,
  CheckCircle,
  Paperclip,
  ArrowUp,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
};

@NgModule({
  declarations: [
    AgencyComponent,
    AgencyListComponent,
    AddEditAgencyComponent,
    GeneralInfoGroupComponent,
    BillingDetailsGroupComponent,
    ContactDetailsGroupComponent,
    PaymentDetailsGridComponent,
    CandidatesComponent,
    AddEditCandidateComponent,
    CandidateGeneralInfoComponent,
    CandidateContactDetailsComponent,
    CandidateProfessionalSummaryComponent,
    ExperienceGridComponent,
    EducationGridComponent,
    CredentialsGridComponent,
    CandidateAgencyComponent,
    FileViewerComponent,
    OrderManagementComponent,
    TabNavigationComponent,
    OrderManagementGridComponent,
    PreviewOrderDialogComponent,
    ProfileComponent,
    OrderCandidatesComponent,
    CandidatDialogComponent,
    CandidatDetailsComponent,
    AgencyOrderFiltersComponent,
    AgencyListFiltersComponent,
    ImportCandidatesComponent,
    CandidateProfileComponent,
    CandidateEducationComponent,
    CandidateExperienceComponent,
    ElectronicFormComponent,
    ManualFormComponent,
    PaymentDialogComponent,
    JobDistributionComponent,
    OrderMatchColumnComponent,
    AgencyNameComponent,
  ],
  imports: [
    CommonModule,
    AgencyRoutingModule,
    SharedModule,
    ReactiveFormsModule,

    SwitchModule,
    GridModule,
    PdfViewerModule,
    ListBoxModule,
    ButtonModule,
    AccordionModule,
    DropDownListModule,
    CheckBoxModule,
    GridAllModule,
    ChipListModule,
    PagerModule,
    TooltipModule,
    NumericTextBoxModule,
    TextBoxModule,
    DatePickerModule,
    UploaderModule,
    TabAllModule,
    DialogAllModule,
    MultiSelectAllModule,
    MultiselectDropdownModule,
    MaskedTextBoxModule,
    DropDownButtonModule,
    AddEditReorderModule,
    CandidateDetailsModule,
    ExtensionModule,
    AssociateListModule,
    RadioButtonModule,
    TooltipContainerModule,
    ScrollToTopModule,

    FeatherModule.pick(sidebarIcons),
    NgxMaskModule.forChild(),
    NgxsModule.forFeature([AgencyState, CandidateState, OrderManagementState]),
    CandidateListModule,
    ChildOrderDialogModule,
    BoolValuePipeModule,
    GridPaginationModule
  ],
  exports: [FileViewerComponent],
  providers: [
    CredentialGridService,
    CredentialStorageService,
    CredentialStorageFacadeService,
    OrderCandidateApiService,
    CandidateGeneralInfoService,
  ],
})
export class AgencyModule {}
