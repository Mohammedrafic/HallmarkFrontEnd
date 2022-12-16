import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GridModule } from '@syncfusion/ej2-angular-grids';
import { ToolbarModule } from '@syncfusion/ej2-angular-navigations';

import {
  SaveTemplateDialogComponent,
} from '@client/order-management/components/save-template-dialog/save-template-dialog.component';
import { InputModule } from '@shared/components/form-controls/input/input.module';

@NgModule({
  declarations: [SaveTemplateDialogComponent],
  imports: [CommonModule, InputModule, GridModule, ToolbarModule],
  exports: [SaveTemplateDialogComponent],
})
export class SaveTemplateDialogModule {}
