import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SaveTemplateDialogComponent } from '@client/order-management/save-template-dialog/save-template-dialog.component';
import { InputModule } from '@shared/components/form-controls/input/input.module';
import { GridModule } from '@syncfusion/ej2-angular-grids';
import { ToolbarModule } from '@syncfusion/ej2-angular-navigations';

@NgModule({
  declarations: [SaveTemplateDialogComponent],
  imports: [CommonModule, InputModule, GridModule, ToolbarModule],
  exports: [SaveTemplateDialogComponent],
})
export class SaveTemplateDialogModule {}
