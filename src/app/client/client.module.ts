import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { FeatherModule } from 'angular-feather';
import {
  AlertTriangle,
  AlignJustify,
  Briefcase,
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Clipboard,
  Clock,
  Copy,
  Download,
  Edit,
  Edit3,
  Folder,
  Lock,
  MapPin,
  Menu,
  MessageSquare,
  MoreVertical,
  Plus,
  Search,
  Slash,
  Sliders,
  Trash2,
  Unlock,
  Upload,
  User,
  X,
  XCircle,
  Flag,
  Mail,
  Compass,
  ArrowUp
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
import { ButtonModule, CheckBoxModule, ChipListModule, RadioButtonModule,
  SwitchModule } from '@syncfusion/ej2-angular-buttons';
import { DropDownButtonAllModule, DropDownButtonModule, SplitButtonModule } from '@syncfusion/ej2-angular-splitbuttons';
import { MaskedTextBoxModule, NumericTextBoxModule, TextBoxModule } from '@syncfusion/ej2-angular-inputs';
import { DropDownListModule, ListBoxModule, MultiSelectAllModule } from '@syncfusion/ej2-angular-dropdowns';
import { MenuModule, TabAllModule } from '@syncfusion/ej2-angular-navigations';
import { DatePickerModule, MaskedDateTimeService, TimePickerModule } from '@syncfusion/ej2-angular-calendars';

import { ClientRoutingModule } from './client-routing.module';
import { OrderManagementContentComponent,
} from './order-management/components/order-management-content/order-management-content.component';
import { CandidatesContentComponent } from './candidates/candidates-content/candidates-content.component';
import { InvoicesContentComponent } from './invoices/invoices-content/invoices-content.component';
import { TimesheetsContentComponent } from './timesheets/timesheets-content/timesheets-content.component';
import { ReportsContentComponent } from './reports/reports-content/reports-content.component';
import { ClientComponent } from './client.component';
import { TabNavigationComponent,
} from './order-management/components/order-management-content/tab-navigation/tab-navigation.component';
import { SharedModule } from '@shared/shared.module';
import { OrderCredentialsModule } from '@order-credentials/order-credentials.module';
import { NgxsModule } from '@ngxs/store';
import { OrderManagementContentState } from '@client/store/order-managment-content.state';
import { OrganizationManagementState } from '@organization-management/store/organization-management.state';
import { OrderDetailsDialogComponent,
} from './order-management/components/order-details-dialog/order-details-dialog.component';
import { DialogModule, TooltipModule } from '@syncfusion/ej2-angular-popups';
import { ChipsCssClass } from '@shared/pipes/chips-css-class.pipe';
import { OrderDetailsContainerComponent,
} from './order-management/components/order-details-container/order-details-container.component';
import { OrderCandidatesContainerComponent,
} from './order-management/components/order-candidates-container/order-candidates-container.component';
import { AgGridModule } from '@ag-grid-community/angular';
import { AddEditReorderModule } from '@client/order-management/components/add-edit-reorder/add-edit-reorder.module';
import { SaveTemplateDialogModule,
} from '@client/order-management/components/save-template-dialog/save-template-dialog.module';
import { CloseOrderModule } from '@client/order-management/components/close-order/close-order.module';
import { CandidateListModule } from '@shared/components/candidate-list/candidate-list.module';
import { ChildOrderDialogModule } from '@shared/components/child-order-dialog/child-order-dialog.module';
import { ExtensionModule } from '@shared/components/extension/extension.module';
import { CandidateDetailsModule } from '@shared/components/candidate-details/candidate-details.module';
import { AssociateListModule } from '@shared/components/associate-list/associate-list.module';
import { ReopenOrderModule } from '@client/order-management/components/reopen-order/reopen-order.module';
import { TooltipContainerModule } from '@shared/components/tooltip-container/tooltip.module';
import { OrderDetailsService } from '@client/order-management/components/order-details-form/services';
import { MatMenuModule } from '@angular/material/menu';
import { SettingsViewService } from '@shared/services';
import { OrderImportComponent } from './order-management/components/order-import/order-import.component';
import { ImportDialogContentModule } from '@shared/components/import-dialog-content/import-dialog-content.module';
import { CreateEditOrderModule } from '@client/order-management/create-edit-order.module';
import { ButtonGroupModule } from '@shared/components/button-group/button-group.module';
import {
  GridHeaderActionsModule,
} from '@shared/components/grid/cell-renderers/grid-header-actions/grid-header-actions.module';
import { GridPaginationModule } from '@shared/components/grid/grid-pagination/grid-pagination.module';
import { SwitchEditorModule } from '@shared/components/switch-editor/switch-editor.module';
import { OrderManagementIrpApiService } from '@shared/services/order-management-irp-api.service';
import { BoolValuePipeModule } from '@shared/pipes/bool-values/bool-values-pipe.module';
import { OrderCandidateApiService } from '@shared/components/order-candidate-list/order-candidate-api.service';
import { OrganizationCandidatesModule } from '@client/candidates/organization-candidates.module';
import { OrderManagementIrpRowPositionModule } from '@shared/components/grid/cell-renderers/order-management-irp-row-position/order-management-irp-row-position.module';
import { OrderManagementSubrowCandidatePositionModule } from '@shared/components/order-management-subrow-candidate-position/order-management-subrow-candidate-position.module';
import { ScrollToTopModule } from '@shared/components/scroll-to-top/scroll-to-top.module';

const gridIcons = {
  MessageSquare,
  Lock,
  Unlock,
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
  Slash,
  Edit3,
  Trash2,
  X,
  User,
  MapPin,
  Briefcase,
  Calendar,
  Folder,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  Clipboard,
  Clock,
  Flag,
  Mail,
  Compass,
  ArrowUp,
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
    OrderDetailsDialogComponent,
    OrderDetailsContainerComponent,
    OrderCandidatesContainerComponent,
    OrderImportComponent,
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
    TooltipModule,
    SplitButtonModule,
    DatePickerModule,
    TimePickerModule,
    OrderCredentialsModule,
    DropDownButtonModule,
    DialogModule,
    RadioButtonModule,
    AgGridModule,
    GridPaginationModule,
    AddEditReorderModule,
    SaveTemplateDialogModule,
    CloseOrderModule,
    ReopenOrderModule,
    CandidateListModule,
    SwitchModule,
    CandidateDetailsModule,
    ChildOrderDialogModule,
    AssociateListModule,
    DropDownButtonAllModule,
    TooltipContainerModule,
    MatMenuModule,
    //STORE
    NgxsModule.forFeature([OrderManagementContentState, OrganizationManagementState]),
    ExtensionModule,
    ImportDialogContentModule,
    ListBoxModule,
    CreateEditOrderModule,
    ButtonGroupModule,
    GridHeaderActionsModule,
    OrderManagementIrpRowPositionModule,
    SwitchEditorModule,
    BoolValuePipeModule,
    OrganizationCandidatesModule,
    OrderManagementSubrowCandidatePositionModule,
    ScrollToTopModule,
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
    MaskedDateTimeService,
    SettingsViewService,
    OrderDetailsService,
    OrderManagementIrpApiService,
    OrderCandidateApiService,
  ],
})
export class ClientModule {}
