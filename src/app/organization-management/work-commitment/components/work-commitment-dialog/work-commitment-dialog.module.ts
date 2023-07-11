import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from '@syncfusion/ej2-angular-popups';
import { ReactiveFormsModule } from '@angular/forms';
import { DatepickerModule } from '@shared/components/form-controls/datepicker/datepicker.module';
import { TimepickerModule } from '@shared/components/form-controls/timepicker/timepicker.module';
import { InputModule } from '@shared/components/form-controls/input/input.module';
import { NumericTextboxModule } from '@shared/components/form-controls/numeric-textbox/numeric-textbox.module';
import {
  MultiselectDropdownModule,
} from '@shared/components/form-controls/multiselect-dropdown/multiselect-dropdown.module';
import { DropdownModule } from '@shared/components/form-controls/dropdown/dropdown.module';
import { WorkCommitmentDialogComponent } from './work-commitment-dialog.component';
import { ButtonModule } from '@shared/components/button/button.module';
import { WorkCommitmentDialogApiService } from '../../services/work-commitment-dialog-api.service';
import { WorkCommitmentService } from '../../services/work-commitment.service';
import {
  ReplacementOrderConfirmationModule,
} from '@shared/components/replacement-order-confirmation/replacement-order-confirmation.module';

@NgModule({
  declarations: [WorkCommitmentDialogComponent],
  imports: [
    CommonModule,
    ButtonModule,
    DialogModule,
    ReactiveFormsModule,
    DatepickerModule,
    TimepickerModule,
    InputModule,
    NumericTextboxModule,
    MultiselectDropdownModule,
    DropdownModule,
    ReplacementOrderConfirmationModule,
  ],
  exports: [WorkCommitmentDialogComponent],
  providers: [WorkCommitmentService, WorkCommitmentDialogApiService],
})
export class WorkCommitmentDialogModule {}
