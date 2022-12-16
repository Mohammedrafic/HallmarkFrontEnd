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
import { SwitchModule } from '@syncfusion/ej2-angular-buttons';
import { TextareaModule } from '@shared/components/form-controls/textarea/textarea.module';

@NgModule({
  declarations: [GeneralNotesComponent, CandidateDetailsComponent, GeneralInfoComponent, HrInfoComponent, ContactDetailsComponent],
  exports: [CandidateDetailsComponent, GeneralNotesComponent],
  imports: [CommonModule, InputModule, DatepickerModule, DropdownModule, MultiselectDropdownModule, SwitchModule, TextareaModule]
})
export class CandidateProfileModule {
}
