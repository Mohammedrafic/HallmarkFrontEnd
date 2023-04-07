import { AgGridModule } from '@ag-grid-community/angular';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { GridModule } from '@shared/components/grid/grid.module';
import { TooltipContainerModule } from '@shared/components/tooltip-container/tooltip.module';
import { SharedModule } from '@shared/shared.module';
import { ButtonModule, RadioButtonModule, SwitchModule } from '@syncfusion/ej2-angular-buttons';
import { DropDownListAllModule, DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { GridAllModule, PagerAllModule } from '@syncfusion/ej2-angular-grids';
import { NumericTextBoxAllModule, TextBoxAllModule } from '@syncfusion/ej2-angular-inputs';
import { TabAllModule } from '@syncfusion/ej2-angular-navigations';
import { FeatherModule } from 'angular-feather';
import { Edit, Trash2, RotateCw } from 'angular-feather/icons';

import { ToggleIconRendererModule } from '@shared/components/cell-renderers/toggle-icon-renderer';
import { ValidateDirectiveModule } from '@shared/directives/validate-directive/validate-directive.module';
import { OrientationComponent } from './orientation.component';
import { OrientationService } from './services/orientation.service';
import { OrientationRoutingModule } from './orientation-routing.module';
import { OrientationHistoricalDataComponent } from './components/orientation-historical-data/orientation-historical-data.component';
import { OrientationSetupComponent } from './components/orientation-setup/orientation-setup.component';
import { OrientationGridComponent } from './components/orientation-grid/orientation-grid.component';
import { DropdownModule } from '@shared/components/form-controls/dropdown/dropdown.module';
import { DatepickerModule } from '@shared/components/form-controls/datepicker/datepicker.module';
import { OrientationGridActionRendererComponent } from './components/orientation-grid/grid-action-renderer/grid-action-renderer.component';
import { SkillNameRendererComponent } from './components/orientation-grid/skill-name-renderer/skill-name.component';
import { JoinPipeModule } from '@shared/pipes/join.pipe';
import { MultiplePipeModule } from '@shared/pipes/multiple.pipe';
import { SkillCategoryRendererComponent } from './components/orientation-grid/skill-category-renderer/skill-category.component';
import { HistoricalDataActionRendererComponent } from './components/orientation-grid/historical-data-action-renderer/historical-data-action-renderer.component';
import { DropDownButtonModule } from '@syncfusion/ej2-angular-splitbuttons';

const icons = {
  Edit,
  Trash2,
  RotateCw
};

@NgModule({
  imports: [
    CommonModule,
    DropDownButtonModule,
    GridAllModule,
    NumericTextBoxAllModule,
    PagerAllModule,
    FeatherModule.pick(icons),
    TooltipContainerModule,
    ButtonModule,
    TabAllModule,
    SharedModule,
    ReactiveFormsModule,
    RadioButtonModule,
    GridModule,
    AgGridModule,
    ToggleIconRendererModule,
    SwitchModule,
    TextBoxAllModule,
    ValidateDirectiveModule,
    OrientationRoutingModule,
    DropdownModule,
    DatepickerModule,
    MultiplePipeModule,
    JoinPipeModule,
  ],
  declarations: [
    OrientationComponent,
    OrientationHistoricalDataComponent,
    OrientationGridComponent,
    OrientationSetupComponent,
    OrientationGridActionRendererComponent,
    SkillNameRendererComponent,
    SkillCategoryRendererComponent,
    HistoricalDataActionRendererComponent,
  ],
  providers: [OrientationService],
  exports: [OrientationComponent],
})
export class OrientationModule {}