import { ButtonModule as SFButtonModule } from '@syncfusion/ej2-angular-buttons';
import { FeatherModule } from 'angular-feather';

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ButtonComponent } from './button.component';
import { ButtonClassPipe } from './button-class.pipe';

@NgModule({
  declarations: [ButtonComponent, ButtonClassPipe],
  imports: [CommonModule, SFButtonModule, FeatherModule],
  exports: [ButtonComponent],
})
export class ButtonModule {}
