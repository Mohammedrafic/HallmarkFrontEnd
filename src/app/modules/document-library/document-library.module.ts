import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentLibrarySidePanelComponent } from './components/document-library-side-panel/document-library-side-panel.component';
import { DocumentManagementComponent } from './components/document-management/document-management.component';
import { DocumentLibraryRoutingModule } from './document-library-routing.module';
import { DocumentLibraryComponent } from './components/document-management/document-library/document-library.component';
import { TreeViewModule, TabAllModule, TabModule } from '@syncfusion/ej2-angular-navigations';
import { NgxsModule } from '@ngxs/store';
import { DocumentLibraryState } from './store/state/document-library.state';
import { FeatherModule } from 'angular-feather';
import { SharedModule } from '../../shared/shared.module';
import { AgGridModule } from '@ag-grid-community/angular';
import {
  ButtonModule,
  CheckBoxModule,
  ChipListModule,
  RadioButtonModule,
  SwitchModule,
} from '@syncfusion/ej2-angular-buttons';
import { DropDownButtonAllModule, DropDownButtonModule, SplitButtonModule } from '@syncfusion/ej2-angular-splitbuttons';
import {
  AutoCompleteModule,
  DropDownListModule,
  MultiSelectModule,
  MultiSelectAllModule
} from '@syncfusion/ej2-angular-dropdowns';
import { DatePickerModule, DateTimePickerModule, TimePickerModule } from '@syncfusion/ej2-angular-calendars';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DialogModule } from '@syncfusion/ej2-angular-popups';
import {
  Download,
  Upload,
  Search,
  File,
  Edit,
  Share2,
  MoreVertical
} from 'angular-feather/icons';
import { DocumentLibraryTableComponent } from './components/document-management/document-library/document-library-table/document-library-table.component';
import { ActionCellrenderComponent } from './components/cell-render/action-cellrender/action-cellrender.component';
import { StatusTextCellrenderComponent } from './components/cell-render/status-text-cellrender/status-text-cellrender.component';
import { DocumentLibraryUploadComponent } from './components/document-management/document-library/document-library-upload/document-library-upload.component';
import { GridModule } from '@shared/components/grid/grid.module';
import {
  MaskedTextBoxModule,
  NumericTextBoxModule,
  TextBoxModule,
  UploaderModule,
} from '@syncfusion/ej2-angular-inputs';
import { LogiReportState } from '../../organization-management/store/logi-report.state';
import { SecurityState } from '../../security/store/security.state';
import { PdfViewerModule } from '@syncfusion/ej2-angular-pdfviewer';
import { DocumentEditorModule } from '@syncfusion/ej2-angular-documenteditor';
import { DocumentEditorContainerModule } from '@syncfusion/ej2-angular-documenteditor';
import { ScheduleApiService } from '../schedule/services';

const sidebarIcons = {
  Download,
  Upload,
  Search,
  File,
  Edit,
  Share2,
  MoreVertical
};

@NgModule({
  declarations: [
    DocumentLibrarySidePanelComponent,
    DocumentManagementComponent,
    DocumentLibraryComponent,
    DocumentLibraryTableComponent,
    ActionCellrenderComponent,
    StatusTextCellrenderComponent,
    DocumentLibraryUploadComponent
   ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    DocumentLibraryRoutingModule,
    TreeViewModule,
    TabAllModule,
    TabModule,
    FeatherModule.pick(sidebarIcons),
    ButtonModule,
    ChipListModule,
    CheckBoxModule,
    DropDownButtonAllModule,
    DropDownButtonModule,
    SplitButtonModule,
    RadioButtonModule,
    AutoCompleteModule,
    DropDownListModule,
    MultiSelectModule,
    MultiSelectAllModule,
    SwitchModule,
    GridModule,
    AgGridModule,
    MaskedTextBoxModule,
    NumericTextBoxModule,
    TextBoxModule,
    UploaderModule,
    DatePickerModule,
    DateTimePickerModule,
    TimePickerModule,
    DialogModule,
    PdfViewerModule,
    DocumentEditorModule,
    DocumentEditorContainerModule,
    NgxsModule.forFeature([SecurityState, DocumentLibraryState, LogiReportState])
  ],
  providers: [
    ScheduleApiService
  ]
})
export class DocumentLibraryModule { }
