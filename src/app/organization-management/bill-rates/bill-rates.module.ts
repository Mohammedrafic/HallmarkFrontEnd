import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ButtonModule, CheckBoxModule, SwitchModule } from '@syncfusion/ej2-angular-buttons';
import { DatePickerModule } from '@syncfusion/ej2-angular-calendars';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { GridModule, PagerModule } from '@syncfusion/ej2-angular-grids';
import { NumericTextBoxModule } from '@syncfusion/ej2-angular-inputs';
import { TabAllModule, TabModule } from '@syncfusion/ej2-angular-navigations';
import { DropDownButtonModule } from '@syncfusion/ej2-angular-splitbuttons';
import { FeatherModule } from 'angular-feather';
import { Download, Edit, Search, Sliders, Trash2, Upload } from 'angular-feather/icons';

import { ImportDialogContentModule } from '@shared/components/import-dialog-content/import-dialog-content.module';
import { TooltipContainerModule } from '@shared/components/tooltip-container/tooltip.module';
import { SharedModule } from '@shared/shared.module';

import { BillRateSetupComponent } from './bill-rate-setup/bill-rate-setup.component';
import { BillRateTypeMappingComponent } from './bill-rate-type-mapping/bill-rate-type-mapping.component';
import { ExternalBillRateComponent } from './external-bill-rate/external-bill-rate.component';
import { ImportBillRatesComponent } from './import-bill-rates/import-bill-rates.component';
import { BillRatesComponent } from './bill-rates.component';
import { BillRatesRoutingModule } from './bill-rates-routing.module';

const icons = {
  Download,
  Upload,
  Sliders,
  Edit,
  Trash2,
  Search,
};

@NgModule({
  declarations: [
    BillRatesComponent,
    ImportBillRatesComponent,
    ExternalBillRateComponent,
    BillRateTypeMappingComponent,
    BillRateSetupComponent,
  ],
  imports: [
    CommonModule,
    BillRatesRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    PagerModule,
    GridModule,
    ButtonModule,
    DropDownListModule,
    CheckBoxModule,
    NumericTextBoxModule,
    DatePickerModule,
    TabModule,
    TabAllModule,
    SwitchModule,
    DropDownButtonModule,
    TooltipContainerModule,
    ImportDialogContentModule,
    FeatherModule.pick(icons),
  ],
})
export class BillRatesModule { }
