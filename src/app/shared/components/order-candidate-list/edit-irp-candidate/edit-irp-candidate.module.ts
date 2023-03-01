import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { ButtonModule } from '@syncfusion/ej2-angular-buttons';
import { FeatherModule } from 'angular-feather';
import { DialogModule } from '@syncfusion/ej2-angular-popups';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { DatePickerModule } from '@syncfusion/ej2-angular-calendars';

import { EditIrpCandidateComponent } from './edit-irp-candidate.component';
import { Icon } from '@shared/components/order-candidate-list/edit-irp-candidate/constants/edit-irp-candidate.constant';
import { EditIrpCandidateService } from '@shared/components/order-candidate-list/edit-irp-candidate/services';
import { OrderCandidateApiService } from '@shared/components/order-candidate-list/order-candidate-api.service';

@NgModule({
  declarations: [
    EditIrpCandidateComponent,
  ],
  imports: [
    CommonModule,
    ButtonModule,
    DialogModule,
    DropDownListModule,
    DatePickerModule,
    ReactiveFormsModule,

    FeatherModule.pick(Icon),
  ],
  exports: [
    EditIrpCandidateComponent,
  ],
  providers: [EditIrpCandidateService, OrderCandidateApiService],
})
export class EditIrpCandidateModule { }
