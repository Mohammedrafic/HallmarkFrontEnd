import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


import { AgGridModule } from '@ag-grid-community/angular';
import { ChipsCssClass } from '@shared/pipes/chips-css-class.pipe';
import { PdfViewerModule } from '@syncfusion/ej2-angular-pdfviewer';
import { NgxsModule } from '@ngxs/store';
import { FeatherModule } from 'angular-feather';
import { DialogAllModule, TooltipModule } from '@syncfusion/ej2-angular-popups';
import { ButtonModule, CheckBoxModule, ChipListModule, SwitchModule } from '@syncfusion/ej2-angular-buttons';
import { DateTimePickerModule, TimePickerModule } from '@syncfusion/ej2-angular-calendars';
import { TabAllModule } from '@syncfusion/ej2-angular-navigations';
import { FileText, ChevronRight, AlignJustify, Briefcase, Calendar, CheckCircle, ChevronDown,
  Copy, Download, Edit, Edit3, Folder, Lock, MapPin, Menu, MessageSquare, MoreVertical, Plus, Search, Sliders, Trash2,
  Upload, User, X, XCircle, AlertTriangle,
} from 'angular-feather/icons';
import { GridAllModule, PagerModule } from '@syncfusion/ej2-angular-grids';
import { DropDownButtonModule } from '@syncfusion/ej2-angular-splitbuttons';
import { DropDownListModule, MultiSelectModule } from '@syncfusion/ej2-angular-dropdowns';
import { NumericTextBoxModule, TextBoxModule, UploaderModule } from '@syncfusion/ej2-angular-inputs';
import { DatePickerModule, MaskedDateTimeService } from '@syncfusion/ej2-angular-calendars';
import { AccumulationChartAllModule, ChartAllModule } from '@syncfusion/ej2-angular-charts';

import { ControlConverterModule } from '@shared/pipes/control-converter/control-converter.module';
import { SharedModule } from '@shared/shared.module';
import { DateWeekPickerModule } from '@shared/components/date-week-picker/date-week-picker.module';
import { TimesheetsRoutingModule } from './timesheets-routing.module';
import { TimesheetsContainerComponent } from './containers/timesheets-container/timesheets-container.component';
import { TimesheetsTableComponent } from './components/timesheets-table/timesheets-table.component';
import { TimesheetsState } from './store/state/timesheets.state';
import { TimesheetsApiService } from './services/timesheets-api.service';
import { ProfileDetailsContainerComponent } from './containers/profile-details-container/profile-details-container.component';
import { ProfileTimesheetTableComponent } from './components/profile-timesheet-table/profile-timesheet-table.component';
import { AddTimesheetComponent } from './components/add-timesheet/add-timesheet.component';
import { AddRecordService } from './services/add-record.service';
import { ProfileDetailsJobInfoComponent } from './components/profile-details-job-info/profile-details-job-info.component';
import { ProfileCumulativeHoursComponent } from './components/profile-cumulative-hours/profile-cumulative-hours.component';
import { ProfileInvoicesComponent } from './components/profile-invoices/profile-invoices.component';
import { TimesheetsService } from './services/timesheets.service';
import { TimesheetRejectReasonDialogComponent } from './components/reject-reason-dialog/timesheet-reject-reason-dialog.component';
import { TimesheetDetailsApiService } from './services/timesheet-details-api.service';
import { TimesheetRecordsService } from './services/timesheet-records.service';
import { DropdownEditorComponent } from './components/cell-editors/dropdown-editor/dropdown-editor.component';
import { ActionsCellComponent } from './components/cell-editors/actions-cell/actions-cell.component';
import { TimesheetsFilterDialogComponent } from './components/timesheets-filter-dialog/timesheets-filter-dialog.component';
import { GridModule } from '@shared/components/grid/grid.module';
import { TimesheetTableStatusCellComponent } from './components/timesheets-table/timesheet-table-status-cell/timesheet-table-status-cell.component';
import { ProfileMilesComponent } from './components/profile-cumulative-hours/profile-miles/profile-miles.component';
import { InputEditorComponent } from './components/cell-editors/input-editor/input-editor.component';
import { GridDateEditorComponent } from './components/cell-editors/grid-date-editor/grid-date-editor.component';
import {
  TimesheetTableApproveCellComponent
} from './components/timesheets-table/timesheet-table-approve-cell/timesheet-table-approve-cell.component';
import { TimesheetTableLinkComponent } from './components/timesheets-table/timesheet-table-link/timesheet-table-link.component';
import { TimesheetDetailsService } from './services/timesheet-details.service';
import { FileViewerModule } from '@shared/modules/file-viewer/file-viewer.module';
import { DateRangeWeekPickerModule } from '@shared/components/date-range-week-picker/date-range-week-picker.module';
import { TimesheetsTabsComponent } from './components/timesheets-tabs/timesheets-tabs.component';
import { AddDialogHelperService, DateWeekService } from '@core/services';
import { AttachmentsModule } from '@shared/components/attachments';
import { AddDialogHelper } from '@core/helpers';
import { UploadButtonComponent } from './components/upload-button/upload-button.component';
import { FileUploaderModule } from '@shared/components/file-uploader/file-uploader.module';
import { FiltersDialogHelper } from '@core/helpers/filters-dialog.helper';
import { FiltersDialogHelperService } from '@core/services/filters-dialog-helper.service';
import { TimesheetsTableFiltersColumns } from './enums';
import { APP_FILTERS_CONFIG } from '@core/constants/filters-helper.constant';

const gridIcons = {
  MessageSquare,
  Lock,
  FileText,
  ChevronDown,
  ChevronRight,
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
  AlertTriangle,
};

@NgModule({
  declarations: [
    TimesheetsContainerComponent,
    TimesheetsTableComponent,
    ProfileDetailsContainerComponent,
    ProfileTimesheetTableComponent,
    AddTimesheetComponent,
    ProfileDetailsJobInfoComponent,
    ProfileCumulativeHoursComponent,
    ProfileInvoicesComponent,
    TimesheetRejectReasonDialogComponent,
    GridDateEditorComponent,
    DropdownEditorComponent,
    ActionsCellComponent,
    TimesheetsFilterDialogComponent,
    TimesheetTableStatusCellComponent,
    TimesheetTableApproveCellComponent,
    TimesheetTableLinkComponent,
    ProfileMilesComponent,
    InputEditorComponent,
    TimesheetsTabsComponent,
    UploadButtonComponent,
  ],
  imports: [
    CommonModule,
    TimesheetsRoutingModule,
    FeatherModule.pick(gridIcons),
    ButtonModule,
    TabAllModule,
    GridAllModule,
    ChipListModule,
    DropDownButtonModule,
    DropDownListModule,
    NumericTextBoxModule,
    PagerModule,
    DatePickerModule,
    ReactiveFormsModule,
    MultiSelectModule,
    TimePickerModule,
    DialogAllModule,
    DateTimePickerModule,
    NgxsModule.forFeature([TimesheetsState]),
    ChartAllModule,
    AccumulationChartAllModule,
    SharedModule,
    FormsModule,
    CheckBoxModule,
    ControlConverterModule,
    DateWeekPickerModule,
    DateRangeWeekPickerModule,
    UploaderModule,
    TextBoxModule,
    TooltipModule,
    SwitchModule,
    AgGridModule,
    GridModule,
    PdfViewerModule,
    FileViewerModule,
    AttachmentsModule,
    FileUploaderModule,
  ],
  exports: [TimesheetsContainerComponent],
  providers: [
    TimesheetsApiService,
    AddRecordService,
    MaskedDateTimeService,
    TimesheetsService,
    TimesheetDetailsApiService,
    ChipsCssClass,
    TimesheetRecordsService,
    TimesheetDetailsService,
    DateWeekService,
    AddDialogHelper,
    FiltersDialogHelper,
    {
      provide: AddDialogHelperService,
      useClass: AddRecordService,
    },
    {
      provide: APP_FILTERS_CONFIG,
      useValue: TimesheetsTableFiltersColumns,
    },
    {
      provide: FiltersDialogHelperService,
      useClass: TimesheetsService,
    },
  ]
})
export class TimesheetsModule {}
