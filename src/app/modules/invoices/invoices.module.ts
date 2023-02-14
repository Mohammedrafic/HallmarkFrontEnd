import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { A11yModule } from '@angular/cdk/a11y';

import {
  AlignJustify, ChevronDown, ChevronRight, Lock, Menu, MessageSquare, MoreVertical, Package,
  Percent, Sliders, Trash2, X, AlertCircle, ChevronsDown, Search, Printer, ArrowUp, Upload,
} from 'angular-feather/icons';
import { GridAllModule, PagerModule } from '@syncfusion/ej2-angular-grids';
import {
  AutoCompleteAllModule,
  DropDownListModule,
  ListBoxModule,
  MultiSelectModule,
} from '@syncfusion/ej2-angular-dropdowns';
import { NumericTextBoxModule, TextBoxAllModule, UploaderAllModule } from '@syncfusion/ej2-angular-inputs';
import { NgxsModule, Store } from '@ngxs/store';
import { FeatherModule } from 'angular-feather';
import { TabModule } from '@syncfusion/ej2-angular-navigations';
import { DropDownButtonModule, SplitButtonModule } from '@syncfusion/ej2-angular-splitbuttons';
import { DialogModule, TooltipModule } from '@syncfusion/ej2-angular-popups';
import { DatePickerAllModule, TimePickerModule } from '@syncfusion/ej2-angular-calendars';
import { AgGridModule } from '@ag-grid-community/angular';
import { ButtonModule, ChipListModule, SwitchAllModule } from '@syncfusion/ej2-angular-buttons';
import { map, of, switchMap } from 'rxjs';

import { SharedModule } from '@shared/shared.module';
import { DateWeekPickerModule } from '@shared/components/date-week-picker/date-week-picker.module';
import { ChipsCssClass } from '@shared/pipes/chips-css-class.pipe';
import { GridModule } from '@shared/components/grid/grid.module';
import { FileUploaderModule } from '@shared/components/file-uploader/file-uploader.module';
import { FiltersDialogHelper } from '@core/helpers/filters-dialog.helper';
import { FiltersDialogHelperService } from '@core/services/filters-dialog-helper.service';
import { APP_FILTERS_CONFIG } from '@core/constants/filters-helper.constant';
import { AddDialogHelperService } from '@core/services';
import { IsOrganizationAgencyAreaStateModel } from '@shared/models/is-organization-agency-area-state.model';
import { InvoicesContainerComponent } from './containers/invoices-container/invoices-container.component';
import { InvoicesRoutingModule } from './invoices-routing.module';
import { InvoicesState } from './store/state/invoices.state';
import { AddInvoiceService, InvoicePrintingService, InvoicesService } from './services';
import { InvoiceRecordDialogComponent } from './components/invoice-record-dialog/invoice-record-dialog.component';
import {
  InvoiceDetailContainerComponent,
} from './containers/invoice-details-container/invoice-detail-container.component';
import {
  InvoiceDetailInvoiceInfoComponent,
} from './components/invoice-detail-invoice-info/invoice-detail-invoice-info.component';
import { InvoiceDetailTableComponent } from './components/invoice-detail-table/invoice-detail-table.component';
import {
  InvoiceRecordsTableRowDetailsComponent,
} from './components/invoice-records-table-row-details/invoice-records-table-row-details.component';
import {
  ToggleRowExpansionHeaderCellComponent,
} from './components/grid-icon-cell/toggle-row-expansion-header-cell.component';
import { ManualInvoiceDialogComponent } from './components/manual-invoice-dialog/manual-invoice-dialog.component';
import { InvoicesFiltersDialogComponent } from './components/invoices-filters-dialog/invoices-filters-dialog.component';
import { InvoicesApiService } from './services/invoices-api.service';
import { InvoicesTableTabsComponent } from './components/invoices-table-tabs/invoices-table-tabs.component';
import { InvoicesTableFiltersColumns } from './enums/invoices.enum';
import { InvoiceTabs, OrganizationId } from './tokens';
import { AGENCY_INVOICE_TABS, ORGANIZATION_INVOICE_TABS } from './constants';
import { AppState } from '../../store/app.state';
import { UserState } from '../../store/user.state';
import {
  RejectReasonInputDialogModule,
} from '@shared/components/reject-reason-input-dialog/reject-reason-input-dialog.module';
import { ManualInvoiceAttachmentsApiService } from './services/manual-invoice-attachments-api.service';
import { FileViewerModule } from '@shared/modules/file-viewer/file-viewer.module';
import { InvoicesContainerService } from './services/invoices-container/invoices-container.service';
import { Router } from '@angular/router';
import { AgencyInvoicesContainerService } from './services/invoices-container/agency-invoices-container.service';
import {
  OrganizationInvoicesContainerService,
} from './services/invoices-container/organization-invoices-container.service';
import { TableStatusCellModule } from '@shared/components/table-status-cell/table-status-cell.module';
import { AllInvoicesActionCellComponent } from './components/all-invoices-action-cell/all-invoices-action-cell.component';
import { NumericalConverterModule } from '@shared/pipes/numerical-converter/numerical-converter.module';
import { InvoiceAgencyResolver } from './resolvers/invoice-agency.resolver';
import { GridOrderIdCellComponent } from './components/grid-order-id-cell/grid-order-id-cell.component';
import { InvoicesPermissionHelper } from './helpers/invoices-permission.helper';
import { TooltipContainerModule } from '@shared/components/tooltip-container/tooltip.module';
import { InvoiceAddPaymentModule } from './components/invoice-add-payment/invoice-add-payment.module';
import { InvoicePaymentDetailsModule } from './components/invoice-payment-details/invoice-payment-details.module';
import { InvoicesFiltersService } from './services/invoices-filters.service';
import { ValidateDirectiveModule } from '@shared/directives/validate-directive/validate-directive.module';
import { InvoiceGridExportComponent } from './components/invoice-grid-export/invoice-grid-export.component';
import { ResponsiveTabsModule } from '@shared/directives/responsive-tabs.directive.ts/responsive-tabs.module';

@NgModule({
  declarations: [
    InvoicesContainerComponent,
    InvoiceRecordDialogComponent,
    InvoiceDetailContainerComponent,
    InvoiceDetailInvoiceInfoComponent,
    InvoiceDetailTableComponent,
    InvoiceRecordsTableRowDetailsComponent,
    ToggleRowExpansionHeaderCellComponent,
    ManualInvoiceDialogComponent,
    InvoicesFiltersDialogComponent,
    InvoicesTableTabsComponent,
    AllInvoicesActionCellComponent,
    GridOrderIdCellComponent,
    InvoiceGridExportComponent,

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
      Trash2,
      AlertCircle,
      ChevronsDown,
      Search,
      Printer,
      ArrowUp,
      Upload,
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
    FileUploaderModule,
    TooltipModule,
    RejectReasonInputDialogModule,
    FileViewerModule,
    SplitButtonModule,
    ListBoxModule,
    A11yModule,
    TableStatusCellModule,
    NumericalConverterModule,
    TooltipContainerModule,
    InvoiceAddPaymentModule,
    InvoicePaymentDetailsModule,
    ValidateDirectiveModule,
    ResponsiveTabsModule
  ],
  providers: [
    InvoicesService,
    InvoicesApiService,
    ChipsCssClass,
    AddInvoiceService,
    FiltersDialogHelper,
    ManualInvoiceAttachmentsApiService,
    InvoicePrintingService,
    InvoiceAgencyResolver,
    InvoicesPermissionHelper,
    InvoicesFiltersService,
    {
      provide: AddDialogHelperService,
      useClass: AddInvoiceService,
    },
    {
      provide: FiltersDialogHelperService,
      useClass: InvoicesService,
    },
    {
      provide: APP_FILTERS_CONFIG,
      useValue: InvoicesTableFiltersColumns,
    },
    {
      provide: InvoiceTabs,
      useFactory: (store: Store) => store.select(AppState.isOrganizationAgencyArea).pipe(
          map((data: IsOrganizationAgencyAreaStateModel) => data.isAgencyArea),
          map((agency: boolean) => agency ? AGENCY_INVOICE_TABS : ORGANIZATION_INVOICE_TABS),
      ),
      deps: [Store],
    },
    {
      provide: OrganizationId,
      useFactory: (store: Store) => store.select(AppState.isOrganizationAgencyArea).pipe(
        map((data: IsOrganizationAgencyAreaStateModel) => data.isAgencyArea),
        switchMap((agency: boolean) => agency ? store.select(UserState.lastSelectedOrganizationId) : of(null)),
      ),
      deps: [Store],
    },
    {
      provide: InvoicesContainerService,
      useFactory: (router: Router, store: Store) => {
        if (router.url.includes('agency')) {
          return new AgencyInvoicesContainerService(store);
        }
        return new OrganizationInvoicesContainerService(store);
      },
      deps: [Router, Store],
    },
  ],
})
export class InvoicesModule {}
