import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvoicesContainerComponent } from './containers/invoices-container/invoices-container.component';
import { InvoiceRecordsTableComponent } from './components/invoice-records-table/invoice-records-table.component';
import { SharedModule } from "@shared/shared.module";
import { DateWeekPickerModule } from "@shared/components/date-week-picker/date-week-picker.module";
import { FeatherModule } from "angular-feather";
import { TabModule } from "@syncfusion/ej2-angular-navigations";
import { DropDownButtonModule } from "@syncfusion/ej2-angular-splitbuttons";
import { InvoicesRoutingModule } from "./invoices-routing.module";
import { ButtonModule, ChipListModule } from "@syncfusion/ej2-angular-buttons";
import {
  AlignJustify,
  ChevronDown,
  ChevronRight,
  Lock,
  Menu,
  MessageSquare,
  MoreVertical,
  Sliders
} from 'angular-feather/icons';
import { GridAllModule, PagerModule } from "@syncfusion/ej2-angular-grids";
import { DropDownListModule } from "@syncfusion/ej2-angular-dropdowns";
import { NumericTextBoxModule } from "@syncfusion/ej2-angular-inputs";
import { NgxsModule } from "@ngxs/store";
import { InvoicesState } from "./store/state/invoices.state";
import { InvoicesService } from "./services/invoices.service";
import { ReactiveFormsModule } from "@angular/forms";
import { InvoicesTableComponent } from './components/invoices-table/invoices-table.component';
import { DialogModule } from "@syncfusion/ej2-angular-popups";
import { TimePickerModule } from "@syncfusion/ej2-angular-calendars";
import { InvoiceRecordDialogComponent } from './components/invoice-record-dialog/invoice-record-dialog.component';
import { AllInvoicesTableComponent } from './components/all-invoices-table/all-invoices-table.component';
import { AllInvoicesSubrowComponent } from './components/all-invoices-subrow/all-invoices-subrow.component';

@NgModule({
  declarations: [
    InvoicesContainerComponent,
    InvoiceRecordsTableComponent,
    InvoicesTableComponent,
    AllInvoicesTableComponent,
    AllInvoicesSubrowComponent,
    InvoiceRecordDialogComponent,
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
      ChevronDown
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
    PagerModule
  ],
  providers: [
    InvoicesService,
  ]
})
export class InvoicesModule { }
