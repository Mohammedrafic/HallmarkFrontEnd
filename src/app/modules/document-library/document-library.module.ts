import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentLibrarySidePanelComponent } from './components/document-library-side-panel/document-library-side-panel.component';
import { DocumentManagementComponent } from './components/document-management/document-management.component';
import { DocumentLibraryRoutingModule } from './document-library-routing.module';
import { DocumentLibraryComponent } from './components/document-management/document-library/document-library.component';
import { TreeViewModule } from '@syncfusion/ej2-angular-navigations';
import { NgxsModule } from '@ngxs/store';
import { DocumentLibraryState } from './store/state/document-library.state';
import { FeatherModule } from 'angular-feather';
import { SharedModule } from '../../shared/shared.module';
import { AgGridModule } from '@ag-grid-community/angular';
import { GridModule } from '@syncfusion/ej2-angular-grids';
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
  DropDownListModule
} from '@syncfusion/ej2-angular-dropdowns';
import {
  Download,
  Upload,
  Search,
  File,
  Edit,
  Share2
} from 'angular-feather/icons';
import { DocumentLibraryTableComponent } from './components/document-management/document-library/document-library-table/document-library-table.component';

const sidebarIcons = {
  Download,
  Upload,
  Search,
  File,
  Edit,
  Share2
};

@NgModule({
  declarations: [
    DocumentLibrarySidePanelComponent,
    DocumentManagementComponent,
    DocumentLibraryComponent,
    DocumentLibraryTableComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    DocumentLibraryRoutingModule,
    TreeViewModule,
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
    SwitchModule,
    GridModule,
    AgGridModule,
    NgxsModule.forFeature([DocumentLibraryState])
  ]
})
export class DocumentLibraryModule { }
