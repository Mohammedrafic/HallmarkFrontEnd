import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputModule } from '@shared/components/form-controls/input/input.module';
import { DatepickerModule } from '@shared/components/form-controls/datepicker/datepicker.module';
import { DropdownModule } from '@shared/components/form-controls/dropdown/dropdown.module';
import { MultiselectDropdownModule } from '@shared/components/form-controls/multiselect-dropdown/multiselect-dropdown.module';
import { ButtonModule, SwitchModule } from '@syncfusion/ej2-angular-buttons';
import { TextareaModule } from '@shared/components/form-controls/textarea/textarea.module';
import { NumericTextboxModule } from '@shared/components/form-controls/numeric-textbox/numeric-textbox.module';
import { GridModule } from '@shared/components/grid/grid.module';
import { FeatherModule } from 'angular-feather';
import { SharedModule } from '@shared/shared.module';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { CandidateWorkCommitmentComponent } from './candidate-work-commitment.component';

@NgModule({
  declarations: [
    CandidateWorkCommitmentComponent
  ],
  exports: [],
  imports: [
    CommonModule,
    InputModule,
    DatepickerModule,
    DropdownModule,
    MultiselectDropdownModule,
    SwitchModule,
    TextareaModule,
    NumericTextboxModule,
    GridModule,
    FeatherModule,
    ButtonModule,
    SharedModule,
    DropDownListModule,
  ],
  providers: [

  ]
})
export class CandidateWorkCommitmentModule {}
