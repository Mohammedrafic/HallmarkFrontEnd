import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ButtonModule } from '@syncfusion/ej2-angular-buttons';
import { DialogModule } from "@syncfusion/ej2-angular-popups";

import { ReplacementPdOrdersDialogComponent } from './replacement-pd-orders-dialog.component';


@NgModule({
  declarations: [ReplacementPdOrdersDialogComponent],
  imports: [
    CommonModule,
    ButtonModule,
    DialogModule,
  ],
  exports: [ReplacementPdOrdersDialogComponent],
})
export class ReplacementPdOrdersDialogModule { }
