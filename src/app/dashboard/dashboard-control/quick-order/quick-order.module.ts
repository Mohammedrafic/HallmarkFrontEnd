import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ButtonModule } from '@syncfusion/ej2-angular-buttons';
import { DialogModule } from '@syncfusion/ej2-angular-popups';
import { QuickOrderComponent } from './quick-order.component';

@NgModule({
  imports: [CommonModule, DialogModule, ButtonModule],
  declarations: [QuickOrderComponent],
  exports: [QuickOrderComponent],
})
export class QuickOrderModule {}
