import { FileUploaderComponent } from './components/file-uploader/file-uploader.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import {
  AlignJustify, ChevronDown, ChevronRight, Lock, Menu, MessageSquare, MoreVertical,
  Package, Percent, Sliders, X } from 'angular-feather/icons';
import { GridAllModule, PagerModule } from '@syncfusion/ej2-angular-grids';
import { AutoCompleteAllModule, DropDownListModule, MultiSelectModule } from '@syncfusion/ej2-angular-dropdowns';
import { NumericTextBoxModule, TextBoxAllModule, UploaderAllModule } from '@syncfusion/ej2-angular-inputs';
import { NgxsModule } from '@ngxs/store';
import { FeatherModule } from 'angular-feather';
import { TabModule } from '@syncfusion/ej2-angular-navigations';
import { DropDownButtonModule } from '@syncfusion/ej2-angular-splitbuttons';
import { DialogModule } from '@syncfusion/ej2-angular-popups';
import { DatePickerAllModule, TimePickerModule } from '@syncfusion/ej2-angular-calendars';
import { AgGridModule } from '@ag-grid-community/angular';
import { ButtonModule, ChipListModule, SwitchAllModule } from '@syncfusion/ej2-angular-buttons';

import { SharedModule } from '@shared/shared.module';
import { DateWeekPickerModule } from '@shared/components/date-week-picker/date-week-picker.module';
import { ChipsCssClass } from '@shared/pipes/chips-css-class.pipe';
import { GridModule } from '@shared/components/grid/grid.module';
import { InvoicesContainerComponent } from './containers/invoices-container/invoices-container.component';
import { InvoiceRecordsTableComponent } from './components/invoice-records-table/invoice-records-table.component';
import { InvoicesRoutingModule } from './invoices-routing.module';
import { InvoicesState } from './store/state/invoices.state';
import { InvoicesService } from './services';
import { InvoicesTableComponent } from './components/invoices-table/invoices-table.component';
import { InvoiceRecordDialogComponent } from './components/invoice-record-dialog/invoice-record-dialog.component';
import { AllInvoicesTableComponent } from './components/all-invoices-table/all-invoices-table.component';
import { AllInvoicesSubrowComponent } from './components/all-invoices-subrow/all-invoices-subrow.component';
import { InvoiceDetailContainerComponent } from './containers/invoice-details-container/invoice-detail-container.component';
import { InvoiceDetailInvoiceInfoComponent } from './components/invoice-detail-invoice-info/invoice-detail-invoice-info.component';
import { InvoiceDetailTableComponent } from './components/invoice-detail-table/invoice-detail-table.component';
import { InvoiceRecordsTableRowDetailsComponent } from './components/invoice-records-table-row-details/invoice-records-table-row-details.component';
import { ToggleRowExpansionHeaderCellComponent } from './components/grid-icon-cell/toggle-row-expansion-header-cell.component';
import { AddInvoiceService } from './services';
import { ManualInvoiceDialogComponent } from './components/manual-invoice-dialog/manual-invoice-dialog.component';
import { InvoicesFiltersDialogComponent } from './components/invoices-filters-dialog/invoices-filters-dialog.component';
import { InvoicesApiService } from './services/invoices-api.service';
import { InvoicesTableTabsComponent } from './components/invoices-table-tabs/invoices-table-tabs.component';
import { AddDialogHelperService } from '@core/services';
import { InvoiceApiService } from './services/invoice-api.service';

@NgModule({
  declarations: [
    InvoicesContainerComponent,
    InvoiceRecordsTableComponent,
    InvoicesTableComponent,
    AllInvoicesTableComponent,
    AllInvoicesSubrowComponent,
    InvoiceRecordDialogComponent,
    InvoiceDetailContainerComponent,
    InvoiceDetailInvoiceInfoComponent,
    InvoiceDetailTableComponent,
    InvoiceRecordsTableRowDetailsComponent,
    ToggleRowExpansionHeaderCellComponent,
    ManualInvoiceDialogComponent,
    FileUploaderComponent,
    InvoicesFiltersDialogComponent,
    InvoicesTableTabsComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    DateWeekPickerModule,
    FeatherModule.pick({
      AlignJustify,
      Lock,
      Menu,
      MessageSquare,
      MoreVertical,
      Sliders,
      ChevronRight,
      ChevronDown,
      X,
      Percent,
      Package,
    }),
    TabModule,
    DropDownButtonModule,
    InvoicesRoutingModule,
    ButtonModule,
    GridAllModule,
    DropDownListModule,
    NumericTextBoxModule,
    NgxsModule.forFeature([InvoicesState]),
    ReactiveFormsModule,
    DialogModule,
    TimePickerModule,
    ChipListModule,
    PagerModule,
    AgGridModule,
    GridModule,
    TextBoxAllModule,
    UploaderAllModule,
    SwitchAllModule,
    AutoCompleteAllModule,
    DatePickerAllModule,
    MultiSelectModule,
  ],
  providers: [
    InvoicesService,
    InvoicesApiService,
    ChipsCssClass,
    AddInvoiceService,
    InvoiceApiService,
    {
      provide: AddDialogHelperService,
      useClass: AddInvoiceService,
    },
  ]
})
export class InvoicesModule { }
