import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkCommitmentGridComponent } from './work-commitment-grid.component';
import { GridModule } from '@shared/components/grid/grid.module';

@NgModule({
  declarations: [WorkCommitmentGridComponent],
  imports: [CommonModule, GridModule],
  exports: [WorkCommitmentGridComponent],
})
export class WorkCommitmentGridModule {}
