import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { DialogModule } from '@syncfusion/ej2-angular-popups';
import { TextBoxAllModule } from '@syncfusion/ej2-angular-inputs';
import { ButtonModule } from '@syncfusion/ej2-angular-buttons';

import { SharedModule } from '@shared/shared.module';
import {
  RejectReasonInputDialogComponent
} from '@shared/components/reject-reason-input-dialog/reject-reason-input-dialog.component';

@NgModule({
  declarations: [
    RejectReasonInputDialogComponent,
  ],
  imports: [
    CommonModule,
    DialogModule,
    ReactiveFormsModule,
    TextBoxAllModule,
    ButtonModule,
    SharedModule
  ],
  exports: [
    RejectReasonInputDialogComponent,
  ]
})
export class RejectReasonInputDialogModule { }
