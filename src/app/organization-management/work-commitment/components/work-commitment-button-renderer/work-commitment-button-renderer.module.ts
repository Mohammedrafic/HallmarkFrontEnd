import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkCommitmentButtonRenderer } from './work-commitment-button-renderer';
import { ButtonModule } from '@syncfusion/ej2-angular-buttons';
import { FeatherModule } from 'angular-feather';
import { SharedModule } from '@shared/shared.module';

@NgModule({
  declarations: [WorkCommitmentButtonRenderer],
  imports: [CommonModule, ButtonModule, FeatherModule, SharedModule],
  exports: [WorkCommitmentButtonRenderer],
})
export class WorkCommitmentButtonRendererModule {}
