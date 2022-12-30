import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SwitchEditorComponent } from '@shared/components/switch-editor/switch-editor.component';
import { CheckBoxModule } from '@syncfusion/ej2-angular-buttons';

@NgModule({
  declarations: [SwitchEditorComponent],
  imports: [CommonModule, CheckBoxModule],
  exports: [SwitchEditorComponent],
})
export class SwitchEditorModule {}
