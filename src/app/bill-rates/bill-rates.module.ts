import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FeatherModule } from 'angular-feather';
import {
  Edit,
  Plus,
  Trash2
} from 'angular-feather/icons';

import {
  ColumnMenuService,
  EditService,
  FilterService,
  GridModule,
  GroupService,
  PagerModule,
  PageService,
  ResizeService,
  SortService,
  ToolbarService
} from '@syncfusion/ej2-angular-grids';

import { ButtonModule } from '@syncfusion/ej2-angular-buttons';
import { NumericTextBoxModule, TextBoxModule } from '@syncfusion/ej2-angular-inputs';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { DatePickerModule } from '@syncfusion/ej2-angular-calendars';

import { SharedModule } from '@shared/shared.module';

import { BillRatesComponent } from './bill-rates.component';
import { BillRateFormComponent } from './components/bill-rate-form/bill-rate-form.component';
import { BillRatesGridComponent } from './components/bill-rates-grid/bill-rates-grid.component';

const icons = {
  Edit,
  Plus,
  Trash2
}

@NgModule({
  declarations: [
    BillRatesComponent,
    BillRateFormComponent,
    BillRatesGridComponent
  ],
  imports: [
    ButtonModule,
    CommonModule,
    DatePickerModule,
    DropDownListModule,
    FeatherModule.pick(icons),
    GridModule,
    NumericTextBoxModule,
    PagerModule,
    SharedModule,
    TextBoxModule
  ],
  providers: [
    ColumnMenuService,
    EditService,
    FilterService,
    GroupService,
    PageService,
    ResizeService,
    SortService,
    ToolbarService
  ],
  exports: [
    BillRatesComponent
  ]
})
export class BillRatesModule { }
