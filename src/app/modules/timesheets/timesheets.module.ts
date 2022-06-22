import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgxsModule } from '@ngxs/store';

import { GridModule } from '@syncfusion/ej2-angular-grids';
import { FeatherModule } from 'angular-feather';
import { DialogAllModule } from '@syncfusion/ej2-angular-popups';
import { ButtonModule, ChipListModule } from '@syncfusion/ej2-angular-buttons';
import { DateTimePickerModule } from '@syncfusion/ej2-angular-calendars';

import { TimesheetsRoutingModule } from './timesheets-routing.module';
import { TimesheetsContainerComponent } from './containers/timesheets-container/timesheets-container.component';
import { TimesheetsTableComponent } from './components/timesheets-table/timesheets-table.component';
import { TimesheetsState } from './store/state/timesheets.state';
import { TimesheetsApiService } from './services/timesheets-api.service';
import { TabDynamicNavigationComponent } from './components/tab-dynamic-navigation/tab-dynamic-navigation.component';
import { TabAllModule } from '@syncfusion/ej2-angular-navigations';
import { FileText, ChevronRight, AlignJustify, Briefcase, Calendar, CheckCircle, ChevronDown,
  Copy, Download, Edit, Edit3, Folder, Lock, MapPin, Menu, MessageSquare, MoreVertical, Plus, Search, Sliders, Trash2,
  Upload, User, X, XCircle, AlertTriangle,
} from 'angular-feather/icons';
import { GridAllModule, PagerModule } from '@syncfusion/ej2-angular-grids';
import { DropDownButtonModule } from '@syncfusion/ej2-angular-splitbuttons';
import { DropDownListModule, MultiSelectModule } from '@syncfusion/ej2-angular-dropdowns';
import { NumericTextBoxModule } from '@syncfusion/ej2-angular-inputs';
import { DatePickerModule, MaskedDateTimeService } from '@syncfusion/ej2-angular-calendars';
import { ControlConverterPipe } from './pipes/control-converter.pipe';
import { ProfileDetailsContainerComponent } from './containers/profile-details-container/profile-details-container.component';
import { ProfileTimesheetTableComponent } from './components/profile-timesheet-table/profile-timesheet-table.component';

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

import { EditTimesheetComponent } from './components/edit-timesheet/edit-timesheet.component';
import { EditTimesheetService } from './services/edit-timesheet.service';
import { SharedModule } from '@shared/shared.module';

@NgModule({
  declarations: [
    TimesheetsContainerComponent,
    TimesheetsTableComponent,
    TabDynamicNavigationComponent,
    ControlConverterPipe,
    ProfileDetailsContainerComponent,
    ProfileTimesheetTableComponent,
    EditTimesheetComponent,
    ProfileDetailsJobInfoComponent,
    ProfileCumulativeHoursComponent,
    ProfileUploadsComponent,
    ProfileInvoicesComponent,
  ],
  imports: [
    CommonModule,
    TimesheetsRoutingModule,
    NgxsModule.forFeature([TimesheetsState]),
    SharedModule,
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
    GridModule,
    DialogAllModule,
    ButtonModule,
    FeatherModule.pick({
      Download,
      Upload,
      Edit,
      Trash2,
      FileText,
      Plus,
      ChevronDown,
      ChevronRight,
      Copy,
      Star,
      X,
      User,
      MapPin,
      Folder,
      Briefcase,
    }),
    ReactiveFormsModule,
    DateTimePickerModule,
    DropDownListModule,
    NgxsModule.forFeature([TimesheetsState]),
    DialogModule,
    ChartAllModule,
    AccumulationChartAllModule,
    ChipListModule,
    SharedModule,
    DatePickerModule,
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    CheckBoxModule,
  ],
  exports: [TimesheetsContainerComponent],
  providers: [TimesheetsApiService, EditTimesheetService, MaskedDateTimeService]
})
export class TimesheetsModule {}
