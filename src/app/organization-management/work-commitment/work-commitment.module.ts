import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WorkCommitmentRoutingModule } from './work-commitment-routing.module';
import { WorkCommitmentComponent } from './containers/work-commitment-container/work-commitment.component';
import { TooltipContainerModule } from '@shared/components/tooltip-container/tooltip.module';
import { ButtonModule } from '@shared/components/button/button.module';
import { WorkCommitmentGridModule } from './components/work-commitment-grid/work-commitment-grid.module';
import { WorkCommitmentDialogModule } from './components/work-commitment-dialog/work-commitment-dialog.module';
import { WorkCommitmentButtonRendererModule } from './components/work-commitment-button-renderer/work-commitment-button-renderer.module';
import { MultipleRecordsRendererComponent } from './components/multiple-records-renderer/multiple-records-renderer.component';

@NgModule({
  declarations: [WorkCommitmentComponent, MultipleRecordsRendererComponent],
  imports: [
    CommonModule,
    WorkCommitmentRoutingModule,
    WorkCommitmentGridModule,
    WorkCommitmentDialogModule,
    WorkCommitmentButtonRendererModule,
    TooltipContainerModule,
    ButtonModule,
  ],
})
export class WorkCommitmentModule {}
