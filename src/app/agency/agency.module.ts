import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { AccordionModule, TabAllModule } from '@syncfusion/ej2-angular-navigations';
import { ButtonModule, CheckBoxModule, ChipListModule } from '@syncfusion/ej2-angular-buttons';
import { FeatherModule } from 'angular-feather';
import {
  Sliders,
  Plus,
  Trash2,
  Edit,
  Copy,
  Download,
  AlertCircle,
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
} from 'angular-feather/icons';
import { UploaderModule } from "@syncfusion/ej2-angular-inputs";
import { PdfViewerModule } from "@syncfusion/ej2-angular-pdfviewer";
import { ListBoxModule } from '@syncfusion/ej2-angular-dropdowns';
import { AgencyComponent } from './agency.component';
import { AgencyRoutingModule } from './agency-routing.module';
import { AgencyListComponent } from './agency-list/agency-list.component';
import { AddEditAgencyComponent } from './agency-list/add-edit-agency/add-edit-agency.component';
import { SharedModule } from '@shared/shared.module';
import { GeneralInfoGroupComponent } from './agency-list/add-edit-agency/general-info-group/general-info-group.component';
import { DropDownListModule, MultiSelectAllModule } from '@syncfusion/ej2-angular-dropdowns';
import { BillingDetailsGroupComponent } from './agency-list/add-edit-agency/billing-details-group/billing-details-group.component';
import { ContactDetailsGroupComponent } from './agency-list/add-edit-agency/contact-details-group/contact-details-group.component';
import { PaymentDetailsGridComponent } from './agency-list/add-edit-agency/payment-details-grid/payment-details-grid.component';
import { GridAllModule, PagerModule } from '@syncfusion/ej2-angular-grids';
import { MaskedTextBoxModule, NumericTextBoxModule, TextBoxModule } from '@syncfusion/ej2-angular-inputs';
import { CandidatesComponent } from './candidates/candidates.component';
import { AddEditCandidateComponent } from './candidates/add-edit-candidate/add-edit-candidate.component';
import { CandidateGeneralInfoComponent } from './candidates/add-edit-candidate/candidate-general-info/candidate-general-info.component';
import { CandidateContactDetailsComponent } from './candidates/add-edit-candidate/candidate-contact-details/candidate-contact-details.component';
import { CandidateProfessionalSummaryComponent } from './candidates/add-edit-candidate/candidate-professional-summary/candidate-professional-summary.component';
import { DatePickerModule } from '@syncfusion/ej2-angular-calendars';
import { NgxsModule } from '@ngxs/store';
import { AgencyState } from './store/agency.state';
import { CandidateState } from './store/candidate.state';
import { AssociatedOrgGridComponent } from './agency-list/add-edit-agency/associated-org-grid/associated-org-grid.component';
import { InviteDialogComponent } from './agency-list/add-edit-agency/associated-org-grid/invite-dialog/invite-dialog.component';
import { DialogAllModule } from '@syncfusion/ej2-angular-popups';
import { ExperienceGridComponent } from './candidates/add-edit-candidate/experience-grid/experience-grid.component';
import { EducationGridComponent } from './candidates/add-edit-candidate/education-grid/education-grid.component';
import { EditAssociatedDialogComponent } from './agency-list/add-edit-agency/associated-org-grid/edit-associated-dialog/edit-associated-dialog.component';
import { FeeSettingsComponent } from './agency-list/add-edit-agency/associated-org-grid/edit-associated-dialog/fee-settings/fee-settings.component';
import { AddNewFeeDialogComponent } from './agency-list/add-edit-agency/associated-org-grid/edit-associated-dialog/fee-settings/add-new-fee-dialog/add-new-fee-dialog.component';
import { CredentialsGridComponent } from './candidates/add-edit-candidate/credentials-grid/credentials-grid.component';
import { CandidateAgencyComponent } from './candidates/add-edit-candidate/candidate-agency/candidate-agency.component';
import { PartnershipSettingsComponent } from './agency-list/add-edit-agency/associated-org-grid/edit-associated-dialog/partnership-settings/partnership-settings.component';
import { OrderManagementComponent } from './order-management/order-management.component';
import { TabNavigationComponent } from './order-management/tab-navigation/tab-navigation.component';
import { OrderManagementGridComponent } from './order-management/order-management-grid/order-management-grid.component';
import { PreviewOrderDialogComponent } from './order-management/order-management-grid/preview-order-dialog/preview-order-dialog.component';
import { FileViewerComponent } from './candidates/add-edit-candidate/file-viewer/file-viewer.component';
import { ProfileComponent } from './profile/profile.component';
import { OrderCandidatesComponent } from "@agency/order-management/order-management-grid/preview-order-dialog/candidates/order-candidates.component";
import { CandidatDialogComponent } from './order-management/order-management-grid/candidat-dialog/candidat-dialog.component';

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
    AssociatedOrgGridComponent,
    InviteDialogComponent,
    EditAssociatedDialogComponent,
    FeeSettingsComponent,
    ExperienceGridComponent,
    EducationGridComponent,
    AddNewFeeDialogComponent,
    CredentialsGridComponent,
    CandidateAgencyComponent,
    FileViewerComponent,
    PartnershipSettingsComponent,
    OrderManagementComponent,
    TabNavigationComponent,
    OrderManagementGridComponent,
    PreviewOrderDialogComponent,
    ProfileComponent,
    OrderCandidatesComponent,
    CandidatDialogComponent,
  ],
  imports: [
    CommonModule,
    AgencyRoutingModule,
    SharedModule,
    ReactiveFormsModule,

    PdfViewerModule,
    ListBoxModule,
    ButtonModule,
    AccordionModule,
    DropDownListModule,
    CheckBoxModule,
    GridAllModule,
    ChipListModule,
    PagerModule,
    NumericTextBoxModule,
    TextBoxModule,
    DatePickerModule,
    UploaderModule,
    TabAllModule,
    DialogAllModule,
    MultiSelectAllModule,
    MaskedTextBoxModule,
    FeatherModule.pick(sidebarIcons),
    NgxsModule.forFeature([AgencyState, CandidateState]),
  ],
})
export class AgencyModule {}
