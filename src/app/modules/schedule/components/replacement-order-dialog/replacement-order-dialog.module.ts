import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ButtonModule } from '@syncfusion/ej2-angular-buttons';
import { DialogModule } from "@syncfusion/ej2-angular-popups";

import { ReplacementOrderDialogComponent } from './replacement-order-dialog.component';


@NgModule({
  declarations: [ReplacementOrderDialogComponent],
  imports: [
    CommonModule,
    ButtonModule,
    DialogModule,
  ],
  exports: [ReplacementOrderDialogComponent],
})
export class ReplacementOrderDialogModule { }
