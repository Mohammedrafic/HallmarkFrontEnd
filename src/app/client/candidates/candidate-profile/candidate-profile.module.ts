import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeneralNotesComponent } from './general-notes/general-notes.component';
import { CandidateDetailsComponent } from './candidate-details/candidate-details.component';
import { InputModule } from '@shared/components/form-controls/input/input.module';
import { DatepickerModule } from '@shared/components/form-controls/datepicker/datepicker.module';
import { DropdownModule } from '@shared/components/form-controls/dropdown/dropdown.module';
import { MultiselectDropdownModule } from '@shared/components/form-controls/multiselect-dropdown/multiselect-dropdown.module';
import { GeneralInfoComponent } from './candidate-details/general-info/general-info.component';
import { HrInfoComponent } from './candidate-details/hr-info/hr-info.component';
import { ContactDetailsComponent } from './candidate-details/contact-details/contact-details.component';
import { ButtonModule, SwitchModule } from '@syncfusion/ej2-angular-buttons';
import { TextareaModule } from '@shared/components/form-controls/textarea/textarea.module';
import { NumericTextboxModule } from '@shared/components/form-controls/numeric-textbox/numeric-textbox.module';
import { GridModule } from '@shared/components/grid/grid.module';
import { FeatherModule } from 'angular-feather';
import { GeneralNotesGridActionsRendererComponent } from './general-notes/general-notes-grid-actions-renderer/general-notes-grid-actions-renderer.component';
import { AddEditNoteComponent } from './general-notes/add-edit-note/add-edit-note.component';
import { SharedModule } from '@shared/shared.module';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { GeneralNotesGridCategoryRendererComponent } from './general-notes/general-notes-grid-category-renderer/general-notes-grid-category-renderer.component';
import { CandidateProfileService } from '@client/candidates/candidate-profile/candidate-profile.service';
import { CandidateProfileFormService } from '@client/candidates/candidate-profile/candidate-profile-form.service';
import { GeneralNotesService } from '@client/candidates/candidate-profile/general-notes/general-notes.service';
import { DropDownButtonModule } from '@syncfusion/ej2-angular-splitbuttons';
import { NgxsModule } from '@ngxs/store';
import { GeneralNoteState } from './general-notes/general-notes.state';
import { EmployeeGroupMailComponent } from './employee-group-mail/employee-group-mail.component';
import { UploaderModule } from '@syncfusion/ej2-angular-inputs';
import { PdfViewerModule } from '@syncfusion/ej2-angular-pdfviewer';
import { RichTextEditorAllModule } from '@syncfusion/ej2-angular-richtexteditor';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ValidateDirectiveModule } from '@shared/directives/validate-directive/validate-directive.module';
import { ImportEmployeeGeneralNoteComponent } from './general-notes/import-employee-general-note/import-employee-general-note.component';
import { ImportDialogContentModule } from '@shared/components/import-dialog-content/import-dialog-content.module';

@NgModule({
  declarations: [
    GeneralNotesComponent,
    CandidateDetailsComponent,
    GeneralInfoComponent,
    HrInfoComponent,
    ContactDetailsComponent,
    GeneralNotesGridActionsRendererComponent,
    AddEditNoteComponent,
    GeneralNotesGridCategoryRendererComponent,
    EmployeeGroupMailComponent,
    ImportEmployeeGeneralNoteComponent,
  ],
  exports: [CandidateDetailsComponent, GeneralNotesComponent],
  imports: [
    CommonModule,
    InputModule,
    DatepickerModule,
    DropdownModule,
    DropDownButtonModule,
    MultiselectDropdownModule,
    SwitchModule,
    TextareaModule,
    NumericTextboxModule,
    GridModule,
    FeatherModule,
    ButtonModule,
    SharedModule,
    DropDownListModule,
    UploaderModule,
    PdfViewerModule,
    RichTextEditorAllModule,
    FontAwesomeModule,
    ReactiveFormsModule,
    FormsModule,
    ValidateDirectiveModule,
    //STORE
    NgxsModule.forFeature([GeneralNoteState]),
    ImportDialogContentModule
  ],
  providers: [
    CandidateProfileService,
    CandidateProfileFormService,
    GeneralNotesService,
  ]
})
export class CandidateProfileModule {}
