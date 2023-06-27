import { AgGridModule } from '@ag-grid-community/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ButtonModule, RadioButtonModule } from '@syncfusion/ej2-angular-buttons';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { NumericTextBoxModule } from '@syncfusion/ej2-angular-inputs';
import { DropDownButtonModule } from '@syncfusion/ej2-angular-splitbuttons';
import { FeatherModule } from 'angular-feather';
import { Edit, Trash2 } from 'angular-feather/icons';

import { ButtonGroupModule } from '@shared/components/button-group/button-group.module';
import { GridModule as AppGridModule } from '@shared/components/grid/grid.module';
import { TiersDialogModule } from '@shared/components/tiers-dialog/tiers-dialog.module';
import { TooltipContainerModule } from '@shared/components/tooltip-container/tooltip.module';
import { SharedModule } from '@shared/shared.module';

import { TiersService } from './services/tiers.service';
import { GridActionRendererComponent } from './tiers-grid/grid-action-renderer/grid-action-renderer.component';
import { TiersGridComponent } from './tiers-grid/tiers-grid.component';
import { TiersComponent } from './tiers.component';
import { TiersRoutingModule } from './tiers-routing.module';

const icons = {
  Edit,
  Trash2,
};

@NgModule({
  declarations: [
    TiersComponent,
    TiersGridComponent,
    GridActionRendererComponent,
  ],
  imports: [
    CommonModule,
    TiersRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    ButtonModule,
    DropDownListModule,
    RadioButtonModule,
    NumericTextBoxModule,
    DropDownButtonModule,
    AgGridModule,
    AppGridModule,
    TooltipContainerModule,
    TiersDialogModule,
    ButtonGroupModule,
    FeatherModule.pick(icons),
  ],
  providers: [TiersService],
})
export class TiersModule { }
