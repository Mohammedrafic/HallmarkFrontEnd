import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GridModule } from '@shared/components/grid/grid.module';
import { ImportGridComponent } from '@shared/components/import-dialog-content/import-grid/import-grid.component';

@NgModule({
  declarations: [ImportGridComponent],
  imports: [CommonModule, GridModule],
  exports: [ImportGridComponent],
})
export class ImportDialogContentModule {}
