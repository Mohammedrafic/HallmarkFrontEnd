import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FeatherModule } from 'angular-feather';
import { CheckCircle } from 'angular-feather/icons';

import { ToggleIconRendererComponent } from './toggle-icon-renderer.component';

@NgModule({
  imports: [CommonModule, FeatherModule.pick({CheckCircle})],
  declarations: [ToggleIconRendererComponent],
  exports: [ToggleIconRendererComponent],
})
export class ToggleIconRendererModule {}