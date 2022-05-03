import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { AccordionModule } from '@syncfusion/ej2-angular-navigations';
import { ButtonModule, CheckBoxModule } from '@syncfusion/ej2-angular-buttons';
import { FeatherModule } from 'angular-feather';
import {
  Sliders,
  Plus,
  Trash2,
  Edit
} from 'angular-feather/icons';

import { AgencyComponent } from './agency.component';
import { AgencyRoutingModule } from './agency-routing.module';
import { AgencyListComponent } from './agency-list/agency-list.component';
import { AddEditAgencyComponent } from './agency-list/add-edit-agency/add-edit-agency.component';
import { SharedModule } from '../shared/shared.module';
import { GeneralInfoGroupComponent } from './agency-list/add-edit-agency/general-info-group/general-info-group.component';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { BillingDetailsGroupComponent } from './agency-list/add-edit-agency/billing-details-group/billing-details-group.component';
import { ContactDetailsGroupComponent } from './agency-list/add-edit-agency/contact-details-group/contact-details-group.component';
import { PaymentDetailsGridComponent } from './agency-list/add-edit-agency/payment-details-grid/payment-details-grid.component';
import { GridAllModule, GridModule, PagerModule } from '@syncfusion/ej2-angular-grids';
import { NumericTextBoxModule, TextBoxModule } from '@syncfusion/ej2-angular-inputs';
import { CandidatesComponent } from './candidates/candidates.component';
import { AddEditCandidateComponent } from './candidates/add-edit-candidate/add-edit-candidate.component';
import { CandidateGeneralInfoComponent } from './candidates/add-edit-candidate/candidate-general-info/candidate-general-info.component';
import { CandidateContactDetailsComponent } from './candidates/add-edit-candidate/candidate-contact-details/candidate-contact-details.component';
import { CandidateProfessionalSummaryComponent } from './candidates/add-edit-candidate/candidate-professional-summary/candidate-professional-summary.component';
import { DatePickerModule } from '@syncfusion/ej2-angular-calendars';

const sidebarIcons = {
  Sliders,
  Plus,
  Trash2,
  Edit
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
    CandidateProfessionalSummaryComponent
  ],
  imports: [
    CommonModule,
    AgencyRoutingModule,
    SharedModule,
    ReactiveFormsModule,

    ButtonModule,
    AccordionModule,
    DropDownListModule,
    CheckBoxModule,
    GridAllModule,
    PagerModule,
    NumericTextBoxModule,
    TextBoxModule,
    DatePickerModule,
    FeatherModule.pick(sidebarIcons)
  ]
})
export class AgencyModule { }
