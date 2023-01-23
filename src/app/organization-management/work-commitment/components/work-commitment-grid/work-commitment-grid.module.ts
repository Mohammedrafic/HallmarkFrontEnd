import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkCommitmentGridComponent } from './work-commitment-grid.component';
import { GridModule } from '@shared/components/grid/grid.module';
import { WorkCommitmentDialogModule } from '../work-commitment-dialog/work-commitment-dialog.module';

@NgModule({
  declarations: [WorkCommitmentGridComponent],
  imports: [CommonModule, GridModule, WorkCommitmentDialogModule],
  exports: [WorkCommitmentGridComponent],
})
export class WorkCommitmentGridModule {}
