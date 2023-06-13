import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ButtonModule, CheckBoxModule } from '@syncfusion/ej2-angular-buttons';
import { DialogModule } from "@syncfusion/ej2-angular-popups";

import { ReplacementOrderConfirmationComponent } from './replacement-order-confirmation.component';


@NgModule({
  declarations: [ReplacementOrderConfirmationComponent],
  imports: [
    CommonModule,
    ButtonModule,
    DialogModule,
    CheckBoxModule,
  ],
  exports: [ReplacementOrderConfirmationComponent],
})
export class ReplacementOrderConfirmationModule { }
