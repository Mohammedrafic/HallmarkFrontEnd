import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WidgetWrapperModule } from '../widget-wrapper/widget-wrapper.module';
import { FeatherModule } from 'angular-feather';
import { DropDownListModule, MultiSelectAllModule, MultiSelectModule } from '@syncfusion/ej2-angular-dropdowns';
import { MultiselectDropdownModule } from '@shared/components/form-controls/multiselect-dropdown/multiselect-dropdown.module';
import { ProgressBarAllModule } from '@syncfusion/ej2-angular-progressbar';
import { AgGridModule } from '@ag-grid-community/angular';
import {
  Grid
} from 'angular-feather/icons';
import { ClearedToStartComponent } from './cleared-to-start.component';
import { Info } from 'angular-feather/icons';
import { TooltipModule } from '@syncfusion/ej2-angular-popups';
import { GridModule } from '@syncfusion/ej2-angular-grids';


@NgModule({
    imports: [WidgetWrapperModule, CommonModule,  GridModule,AgGridModule,TooltipModule, FeatherModule.pick({ Info })],

   exports: [ClearedToStartComponent],
   declarations: [ClearedToStartComponent]
    
})
export class ClearedtostartModule { }


