import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ButtonModule } from '@syncfusion/ej2-angular-buttons';
import { ButtonGroupComponent } from '@shared/components/button-group/button-group.component';

@NgModule({
  declarations: [ButtonGroupComponent],
  imports: [CommonModule, ButtonModule],
  exports: [ButtonGroupComponent],
})
export class ButtonGroupModule {}
