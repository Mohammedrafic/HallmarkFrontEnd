import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CandidatesComponent } from '@agency/candidates/candidates.component';
import { CandidateAgencyComponent } from '@agency/candidates/add-edit-candidate/candidate-agency/candidate-agency.component';
import { CandidateContactDetailsComponent } from '@agency/candidates/add-edit-candidate/candidate-contact-details/candidate-contact-details.component';
import { CandidateProfessionalSummaryComponent } from '@agency/candidates/add-edit-candidate/candidate-professional-summary/candidate-professional-summary.component';
import { CandidateGeneralInfoComponent } from '@agency/candidates/add-edit-candidate/candidate-general-info/candidate-general-info.component';
import { EducationGridComponent } from '@agency/candidates/add-edit-candidate/education-grid/education-grid.component';
import { ExperienceGridComponent } from '@agency/candidates/add-edit-candidate/experience-grid/experience-grid.component';
import { AgencyFileViewerModule } from '@agency/candidates/add-edit-candidate/file-viewer/agency-file-viewer.module';
import { DropDownListModule, ListBoxModule } from '@syncfusion/ej2-angular-dropdowns';
import { ReactiveFormsModule } from '@angular/forms';
import { ValidateDirectiveModule } from '@shared/directives/validate-directive/validate-directive.module';
import { AddEditCandidateComponent } from '@agency/candidates/add-edit-candidate/add-edit-candidate.component';
import { TabModule } from '@syncfusion/ej2-angular-navigations';
import { SharedModule } from '@shared/shared.module';
import { TooltipContainerModule } from '@shared/components/tooltip-container/tooltip.module';
import { ButtonModule, SwitchModule } from '@syncfusion/ej2-angular-buttons';
import { GridModule as SyncfusionGrid } from '@syncfusion/ej2-angular-grids';
import { DatePickerModule } from '@syncfusion/ej2-angular-calendars';
import { MaskedTextBoxModule, TextBoxModule, UploaderModule } from '@syncfusion/ej2-angular-inputs';
import { NgxMaskModule } from 'ngx-mask';
import { DropDownButtonModule } from '@syncfusion/ej2-angular-splitbuttons';
import { CandidateListModule } from '@shared/components/candidate-list/candidate-list.module';
import { ImportCandidatesComponent } from '@agency/candidates/import-candidates/import-candidates.component';
import { DialogModule } from '@syncfusion/ej2-angular-popups';
import { FeatherModule } from 'angular-feather';
import { CandidateProfileComponent } from '@agency/candidates/import-candidates/candidate-profile/candidate-profile.component';
import { CandidateExperienceComponent } from '@agency/candidates/import-candidates/candidate-experience/candidate-experience.component';
import { CandidateEducationComponent } from '@agency/candidates/import-candidates/candidate-education/candidate-education.component';
import { GridModule } from '@shared/components/grid/grid.module';
import { CandidatesRoutingModule } from '@agency/candidates/candidates-routing.module';
import { CredentialsGridModule } from '@shared/components/credentials-grid/credentials-grid.module';

@NgModule({
  declarations: [
    AddEditCandidateComponent,
    CandidatesComponent,
    CandidateAgencyComponent,
    CandidateContactDetailsComponent,
    CandidateGeneralInfoComponent,
    CandidateProfessionalSummaryComponent,
    EducationGridComponent,
    ExperienceGridComponent,
    ImportCandidatesComponent,
    CandidateProfileComponent,
    CandidateExperienceComponent,
    CandidateEducationComponent,
  ],
  exports: [
    CandidateGeneralInfoComponent,
    CandidateProfessionalSummaryComponent,
    CandidateContactDetailsComponent,
    ExperienceGridComponent,
    EducationGridComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CredentialsGridModule,
    AgencyFileViewerModule,
    DropDownListModule,
    ValidateDirectiveModule,
    TabModule,
    SharedModule,
    TooltipContainerModule,
    ButtonModule,
    SyncfusionGrid,
    DatePickerModule,
    TextBoxModule,
    NgxMaskModule,
    SwitchModule,
    DropDownButtonModule,
    CandidateListModule,
    DialogModule,
    UploaderModule,
    FeatherModule,
    ListBoxModule,
    GridModule,
    CandidatesRoutingModule,
    MaskedTextBoxModule,
  ],
})
export class CandidatesModule {}
