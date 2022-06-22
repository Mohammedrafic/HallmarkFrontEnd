import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

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
  MoreVertical,
  Upload,
  Plus,
  Edit3,
  Trash2,
  Edit,
  Copy,
  XCircle,
  X,
  User,
  MapPin,
  Briefcase,
  Calendar,
  Folder,
  CheckCircle,
  AlertTriangle
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
import { ButtonModule, ChipListModule, CheckBoxModule } from '@syncfusion/ej2-angular-buttons';
import { DropDownButtonModule, SplitButtonModule } from '@syncfusion/ej2-angular-splitbuttons';
import { MaskedTextBoxModule, NumericTextBoxModule, TextBoxModule } from '@syncfusion/ej2-angular-inputs';
import { DropDownListModule, MultiSelectAllModule } from '@syncfusion/ej2-angular-dropdowns';
import { MenuModule, TabAllModule } from '@syncfusion/ej2-angular-navigations';
import {DatePickerModule, MaskedDateTimeService, TimePickerModule} from '@syncfusion/ej2-angular-calendars';

import { ClientRoutingModule } from './client-routing.module';
import { OrderManagementContentComponent } from './order-management/order-management-content/order-management-content.component';
import { CandidatesContentComponent } from './candidates/candidates-content/candidates-content.component';
import { InvoicesContentComponent } from './invoices/invoices-content/invoices-content.component';
import { TimesheetsContentComponent } from './timesheets/timesheets-content/timesheets-content.component';
import { ReportsContentComponent } from './reports/reports-content/reports-content.component';
import { ClientComponent } from './client.component';
import { TabNavigationComponent } from './order-management/order-management-content/tab-navigation/tab-navigation.component';
import { SharedModule } from '../shared/shared.module';
import { AddEditOrderComponent } from './order-management/add-edit-order/add-edit-order.component';
import { OrderDetailsFormComponent } from './order-management/order-details-form/order-details-form.component';

import { OrderCredentialsModule } from '@order-credentials/order-credentials.module';
import { NgxsModule } from '@ngxs/store';
import { OrderManagementContentState } from '@client/store/order-managment-content.state';
import { OrganizationManagementState } from '@organization-management/store/organization-management.state';
import { OrderDetailsDialogComponent } from './order-management/order-details-dialog/order-details-dialog.component';
import { DialogModule } from '@syncfusion/ej2-angular-popups';
import { ChipsCssClass } from '@shared/pipes/chips-css-class.pipe';
import { OrderDetailsContainerComponent } from './order-management/order-details-container/order-details-container.component';
import { OrderCandidatesContainerComponent } from './order-management/order-candidates-container/order-candidates-container.component';

const gridIcons = {
  MessageSquare,
  Lock,
  ChevronDown,
  AlignJustify,
  Menu,
  Sliders,
  Download,
  Search,
  MoreVertical,
  Upload,
  Plus,
  Edit,
  Copy,
  XCircle,
  Edit3,
  Trash2,
  X,
  User,
  MapPin,
  Briefcase,
  Calendar,
  Folder,
  CheckCircle,
  AlertTriangle
};

@NgModule({
  declarations: [
    ClientComponent,
    OrderManagementContentComponent,
    CandidatesContentComponent,
    InvoicesContentComponent,
    TimesheetsContentComponent,
    ReportsContentComponent,
    TabNavigationComponent,
    AddEditOrderComponent,
    OrderDetailsFormComponent,
    OrderDetailsDialogComponent,
    OrderDetailsContainerComponent,
    OrderCandidatesContainerComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    FeatherModule.pick(gridIcons),
    ClientRoutingModule,
    GridModule,
    ButtonModule,
    ChipListModule,
    CheckBoxModule,
    TextBoxModule,
    DropDownListModule,
    MultiSelectAllModule,
    PagerModule,
    MaskedTextBoxModule,
    NumericTextBoxModule,
    MenuModule,
    TabAllModule,
    SplitButtonModule,
    DatePickerModule,
    TimePickerModule,
    OrderCredentialsModule,
    DropDownButtonModule,
    DialogModule,

    //STORE
    NgxsModule.forFeature([
      OrderManagementContentState,
      OrganizationManagementState
    ])
  ],
  providers: [
    ResizeService,
    PageService,
    ToolbarService,
    EditService,
    SortService,
    GroupService,
    ColumnMenuService,
    FilterService,
    ChipsCssClass,
    MaskedDateTimeService
  ]
})
export class ClientModule {}
