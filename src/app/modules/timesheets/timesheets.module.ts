import { ChipsCssClass } from '@shared/pipes/chips-css-class.pipe';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

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
import { CapitalizeFirstModule } from '@shared/pipes/capitalize-first/capitalize-first.module';
import { CapitalizeFirstPipe } from '@shared/pipes/capitalize-first/capitalize-first.pipe';
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
import { EditTimesheetService } from './services/edit-timesheet.service';
import { ProfileDetailsJobInfoComponent } from './components/profile-details-job-info/profile-details-job-info.component';
import { ProfileCumulativeHoursComponent } from './components/profile-cumulative-hours/profile-cumulative-hours.component';
import { ProfileUploadsComponent } from './components/profile-uploads/profile-uploads.component';
import { ProfileInvoicesComponent } from './components/profile-invoices/profile-invoices.component';
import { TimesheetsService } from './services/timesheets.service';
import { TimesheetRejectReasonDialogComponent } from './components/reject-reason-dialog/timesheet-reject-reason-dialog.component';
import { TimesheetDetailsService } from './services/timesheet-details.service';
import { ProfileTimesheetService } from './services/profile-timesheet.service';
import { TimesheetsFilterDialogComponent } from './components/timesheets-filter-dialog/timesheets-filter-dialog.component';
import { GridModule } from '@shared/components/grid/grid.module';
import { TimesheetTableStatusCellComponent } from './components/timesheets-table/timesheet-table-status-cell/timesheet-table-status-cell.component';

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
    ProfileUploadsComponent,
    ProfileInvoicesComponent,
    TimesheetRejectReasonDialogComponent,
    TimesheetsFilterDialogComponent,
    TimesheetTableStatusCellComponent,
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
    CapitalizeFirstModule,
    DateWeekPickerModule,
    UploaderModule,
    TextBoxModule,
    TooltipModule,
    SwitchModule,
    GridModule
  ],
  exports: [TimesheetsContainerComponent],
  providers: [
    TimesheetsApiService,
    EditTimesheetService,
    MaskedDateTimeService,
    TimesheetsService,
    ProfileTimesheetService,
    CapitalizeFirstPipe,
    TimesheetDetailsService,
    ChipsCssClass,
  ]
})
export class TimesheetsModule {}
