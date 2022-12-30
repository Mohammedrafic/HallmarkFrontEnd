import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from "@angular/forms";
import { ChildOrderDialogComponent } from '@shared/components/child-order-dialog/child-order-dialog.component';
import { ButtonModule as CustomButtonModule } from '@shared/components/button/button.module';
import { DropDownListModule } from "@syncfusion/ej2-angular-dropdowns";
import { DialogModule } from '@syncfusion/ej2-angular-popups';
import { ButtonModule, ChipListModule } from '@syncfusion/ej2-angular-buttons';
import { AccordionModule, TabModule } from '@syncfusion/ej2-angular-navigations';
import { FeatherModule } from 'angular-feather';
import { SharedModule } from '@shared/shared.module';
import { ExtensionModule } from '@shared/components/extension/extension.module';
import { DropDownButtonAllModule } from '@syncfusion/ej2-angular-splitbuttons';
import { ChildOrderDialogService } from "./child-order-dialog.service";

@NgModule({
  declarations: [ChildOrderDialogComponent],
  imports: [
    CommonModule,
    ButtonModule,
    DialogModule,
    ChipListModule,
    TabModule,
    ButtonModule,
    FeatherModule,
    SharedModule,
    AccordionModule,
    ExtensionModule,
    CustomButtonModule,
    DropDownButtonAllModule,
    DropDownListModule,
    ReactiveFormsModule,
  ],
  exports: [ChildOrderDialogComponent],
  providers: [ChildOrderDialogService],
})
export class ChildOrderDialogModule {}
