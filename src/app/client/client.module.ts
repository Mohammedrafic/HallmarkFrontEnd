import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FeatherModule } from 'angular-feather';
import {
  MessageSquare,
  Lock,
  ChevronDown,
  AlignJustify,
  Menu,
  Sliders,
  Download,
  Search,
  MoreVertical
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
import { ButtonModule, ChipListModule } from '@syncfusion/ej2-angular-buttons';
import { NumericTextBoxModule, TextBoxModule } from '@syncfusion/ej2-angular-inputs';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { MenuModule, TabAllModule } from '@syncfusion/ej2-angular-navigations';

import { ClientRoutingModule } from './client-routing.module';
import { OrderManagementContentComponent } from './order-management/order-management-content/order-management-content.component';
import { CandidatesContentComponent } from './candidates/candidates-content/candidates-content.component';
import { InvoicesContentComponent } from './invoices/invoices-content/invoices-content.component';
import { TimesheetsContentComponent } from './timesheets/timesheets-content/timesheets-content.component';
import { ReportsContentComponent } from './reports/reports-content/reports-content.component';
import { ClientComponent } from './client.component';
import { TabNavigationComponent } from './order-management/order-management-content/tab-navigation/tab-navigation.component';
import { SharedModule } from '../shared/shared.module';

const gridIcons = {
  MessageSquare,
  Lock,
  ChevronDown,
  AlignJustify,
  Menu,
  Sliders,
  Download,
  Search,
  MoreVertical
};

@NgModule({
  declarations: [
    ClientComponent,
    OrderManagementContentComponent,
    CandidatesContentComponent,
    InvoicesContentComponent,
    TimesheetsContentComponent,
    ReportsContentComponent,
    TabNavigationComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    FeatherModule.pick(gridIcons),
    ClientRoutingModule,
    GridModule,
    ButtonModule,
    ChipListModule,
    TextBoxModule,
    DropDownListModule,
    PagerModule,
    NumericTextBoxModule,
    MenuModule,
    TabAllModule
  ],
  providers: [
    ResizeService,
    PageService,
    ToolbarService,
    EditService,
    SortService,
    GroupService,
    ColumnMenuService,
    FilterService
  ]
})
export class ClientModule {}
