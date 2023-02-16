import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule as CustomButtonModule } from '@shared/components/button/button.module';
import { DropdownModule } from '@shared/components/form-controls/dropdown/dropdown.module';
import { DatepickerModule } from '@shared/components/form-controls/datepicker/datepicker.module';
import { NumericTextboxModule } from '@shared/components/form-controls/numeric-textbox/numeric-textbox.module';
import { ExtensionSidebarComponent } from '@shared/components/extension/extension-sidebar/extension-sidebar.component';
import { SharedModule } from '@shared/shared.module';
import { FeatherModule } from 'angular-feather';
import { ExtensionCandidateInfoComponent } from './extension-sidebar/extension-candidate-info/extension-candidate-info.component';
import { ExtensionGridComponent } from '@shared/components/extension/extension-grid/extension-grid.component';
import { GridModule } from '@shared/components/grid/grid.module';
import { ExtensionGridActionsRendererComponent } from './extension-grid/extension-grid-actions-renderer/extension-grid-actions-renderer.component';
import { ExtensionGridStatusRendererComponent } from './extension-grid/extension-grid-status-renderer/extension-grid-status-renderer.component';
import { ButtonModule, ChipListModule } from '@syncfusion/ej2-angular-buttons';
import { ExtensionGridIdRendererComponent } from './extension-grid/extension-grid-id-renderer/extension-grid-id-renderer.component';

@NgModule({
  declarations: [
    ExtensionSidebarComponent,
    ExtensionCandidateInfoComponent,
    ExtensionGridComponent,
    ExtensionGridActionsRendererComponent,
    ExtensionGridStatusRendererComponent,
    ExtensionGridIdRendererComponent,
  ],
  imports: [
    CommonModule,
    DropdownModule,
    CustomButtonModule,
    DatepickerModule,
    NumericTextboxModule,
    SharedModule,
    FeatherModule,
    GridModule,
    ChipListModule,
    ButtonModule,
  ],
  exports: [ExtensionSidebarComponent, ExtensionGridComponent],
})
export class ExtensionModule {}
