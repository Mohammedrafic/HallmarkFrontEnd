import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WorkCommitmentComponent } from './containers/work-commitment-container/work-commitment.component';
import { TooltipContainerModule } from '@shared/components/tooltip-container/tooltip.module';
import { ButtonModule } from '@shared/components/button/button.module';
import { WorkCommitmentGridModule } from './components/work-commitment-grid/work-commitment-grid.module';
import { WorkCommitmentDialogModule } from './components/work-commitment-dialog/work-commitment-dialog.module';
import { WorkCommitmentButtonRendererModule } from './components/work-commitment-button-renderer/work-commitment-button-renderer.module';

@NgModule({
  declarations: [WorkCommitmentComponent],
  imports: [
    CommonModule,
    WorkCommitmentGridModule,
    WorkCommitmentDialogModule,
    WorkCommitmentButtonRendererModule,
    TooltipContainerModule,
    ButtonModule,
  ],
})
export class WorkCommitmentModule {}
