import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ButtonModule } from '@syncfusion/ej2-angular-buttons';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { GridModule, PagerModule } from '@syncfusion/ej2-angular-grids';
import { NumericTextBoxModule } from '@syncfusion/ej2-angular-inputs';
import { FeatherModule } from 'angular-feather';
import { Edit, Trash2 } from 'angular-feather/icons';

import { TooltipContainerModule } from '@shared/components/tooltip-container/tooltip.module';
import { SharedModule } from '@shared/shared.module';

import { BusinessLinesComponent } from './business-lines.component';
import { BusinessLinesRoutingModule } from './business-lines-routing.module';

const icons = {
  Edit,
  Trash2,
};

@NgModule({
  declarations: [BusinessLinesComponent],
  imports: [
    CommonModule,
    BusinessLinesRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    PagerModule,
    GridModule,
    ButtonModule,
    DropDownListModule,
    NumericTextBoxModule,
    TooltipContainerModule,
    FeatherModule.pick(icons),
  ],
})
export class BusinessLinesModule { }
