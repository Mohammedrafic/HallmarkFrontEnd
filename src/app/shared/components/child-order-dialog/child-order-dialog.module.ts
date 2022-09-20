import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChildOrderDialogComponent } from '@shared/components/child-order-dialog/child-order-dialog.component';
import { ButtonModule as CustomButtonModule } from '@shared/components/button/button.module';
import { DialogModule } from '@syncfusion/ej2-angular-popups';
import { ButtonModule, ChipListModule } from '@syncfusion/ej2-angular-buttons';
import { AccordionModule, TabModule } from '@syncfusion/ej2-angular-navigations';
import { FeatherModule } from 'angular-feather';
import { SharedModule } from '@shared/shared.module';
import { ExtensionModule } from '@shared/components/extension/extension.module';
import { DropDownButtonAllModule } from '@syncfusion/ej2-angular-splitbuttons';

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
    DropDownButtonAllModule
  ],
  exports: [ChildOrderDialogComponent],
})
export class ChildOrderDialogModule {}
