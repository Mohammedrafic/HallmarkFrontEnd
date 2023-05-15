import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ButtonModule } from '@syncfusion/ej2-angular-buttons';
import { DialogModule } from "@syncfusion/ej2-angular-popups";

import { CandidateConfirmDialogComponent } from './candidate-confirm-dialog.component';


@NgModule({
  declarations: [CandidateConfirmDialogComponent],
  imports: [
    CommonModule,
    ButtonModule,
    DialogModule,
  ],
  exports: [CandidateConfirmDialogComponent],
})
export class CandidateConfirmDialogModule { }
