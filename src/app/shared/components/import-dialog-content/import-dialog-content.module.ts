import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GridModule } from '@shared/components/grid/grid.module';
import { ImportGridComponent } from '@shared/components/import-dialog-content/import-grid/import-grid.component';
import { ListBoxModule } from '@syncfusion/ej2-angular-dropdowns';

@NgModule({
  declarations: [ImportGridComponent],
  imports: [CommonModule, GridModule, ListBoxModule],
  exports: [ImportGridComponent],
})
export class ImportDialogContentModule {}
