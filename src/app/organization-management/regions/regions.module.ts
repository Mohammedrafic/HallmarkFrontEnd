import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ButtonModule } from '@syncfusion/ej2-angular-buttons';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { GridModule, PagerModule } from '@syncfusion/ej2-angular-grids';
import { NumericTextBoxModule } from '@syncfusion/ej2-angular-inputs';
import { DropDownButtonModule } from '@syncfusion/ej2-angular-splitbuttons';
import { FeatherModule } from 'angular-feather';
import { Trash2, Upload } from 'angular-feather/icons';

import { GridModule as AppGridModule } from '@shared/components/grid/grid.module';
import { SharedModule } from '@shared/shared.module';

import { ImportRegionsComponent } from './import-regions/import-regions.component';
import { RegionsGridComponent } from './import-regions/regions-grid/regions-grid.component';
import { RegionsComponent } from './regions.component';
import { RegionsRoutingModule } from './regions-routing.module';

const icons = { Upload, Trash2 };

@NgModule({
  declarations: [
    RegionsComponent,
    ImportRegionsComponent,
    RegionsGridComponent,
  ],
  imports: [
    CommonModule,
    RegionsRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    PagerModule,
    GridModule,
    ButtonModule,
    DropDownListModule,
    NumericTextBoxModule,
    DropDownButtonModule,
    AppGridModule,
    FeatherModule.pick(icons),
  ],
})
export class RegionsModule { }
