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

@NgModule({
  declarations: [GeneralNotesComponent, CandidateDetailsComponent, GeneralInfoComponent, HrInfoComponent, ContactDetailsComponent, GeneralNotesGridActionsRendererComponent, AddEditNoteComponent],
  exports: [CandidateDetailsComponent, GeneralNotesComponent],
  imports: [CommonModule, InputModule, DatepickerModule, DropdownModule, MultiselectDropdownModule, SwitchModule, TextareaModule, NumericTextboxModule, GridModule, FeatherModule, ButtonModule, SharedModule, DropDownListModule]
})
export class CandidateProfileModule {
}
