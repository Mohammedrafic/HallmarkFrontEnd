import { ButtonModule as SFButtonModule } from '@syncfusion/ej2-angular-buttons';
import { FeatherModule } from 'angular-feather';

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ButtonComponent } from './button.component';
import { ButtonClassPipe } from './button-class.pipe';
import { ButtonRendererComponent } from './button-renderer/button-renderer.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SharedModule } from '../../shared.module';

@NgModule({
  declarations: [ButtonComponent, ButtonClassPipe, ButtonRendererComponent],
  imports: [CommonModule, SFButtonModule, FeatherModule, FontAwesomeModule, SharedModule],
  exports: [ButtonComponent],
})
export class ButtonModule {}
