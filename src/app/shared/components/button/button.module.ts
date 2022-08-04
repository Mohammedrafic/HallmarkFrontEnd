import { ButtonModule as SFButtonModule } from '@syncfusion/ej2-angular-buttons';
import { FeatherModule } from 'angular-feather';

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ButtonComponent } from './button.component';
import { ButtonClassPipe } from './button-class.pipe';
import { ButtonRendererComponent } from './button-renderer/button-renderer.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@NgModule({
  declarations: [ButtonComponent, ButtonClassPipe, ButtonRendererComponent],
  imports: [CommonModule, SFButtonModule, FeatherModule, FontAwesomeModule],
  exports: [ButtonComponent],
})
export class ButtonModule {}
