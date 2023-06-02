import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { TiersDialogComponent } from './tiers-dialog.component';
import { SharedModule } from '@shared/shared.module';
import { NumericTextBoxModule } from '@syncfusion/ej2-angular-inputs';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { TierService } from '@shared/components/tiers-dialog/services';
import { DialogModule } from '@syncfusion/ej2-angular-popups';
import { ButtonModule, RadioButtonModule, SwitchModule } from '@syncfusion/ej2-angular-buttons';


@NgModule({
  declarations: [
    TiersDialogComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    NumericTextBoxModule,
    DropDownListModule,
    DialogModule,
    ButtonModule,
    SwitchModule,
    RadioButtonModule
  ],
  providers: [TierService],
  exports: [TiersDialogComponent]
})
export class TiersDialogModule { }
