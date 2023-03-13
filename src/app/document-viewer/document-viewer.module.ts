import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentViewerComponent } from './components/document-viewer/document-viewer.component';
import { DocumentViewerRoutingModule } from './document-viewer-routing.module';
import { FailedDocumentViewerComponent } from './components/failed-document-viewer/failed-document-viewer.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { ButtonModule, CheckBoxModule } from '@syncfusion/ej2-angular-buttons';
import { ListBoxModule } from '@syncfusion/ej2-angular-dropdowns';
import { MenuAllModule, SidebarModule, ToolbarModule } from '@syncfusion/ej2-angular-navigations';
import { DialogModule } from '@syncfusion/ej2-angular-popups';
import { FeatherModule } from 'angular-feather';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Maximize2,
  Minimize2,
  RefreshCw,
  X,
  ZoomIn,
  ZoomOut,
} from 'angular-feather/icons';
import { NgxsModule } from '@ngxs/store';
import { DocumentViewerState } from './store/document-viewer.state';

const icons = {
  X,
  ZoomOut,
  ZoomIn,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Minimize2,
  Maximize2,
};

@NgModule({
  declarations: [DocumentViewerComponent, FailedDocumentViewerComponent],
  exports: [DocumentViewerComponent, FailedDocumentViewerComponent],
  imports: [
    DialogModule,
    ButtonModule,
    FeatherModule,
    MenuAllModule,
    SidebarModule,
    CheckBoxModule,
    FormsModule,
    MatButtonModule,
    ToolbarModule,
    ListBoxModule,
    PdfViewerModule,
    ReactiveFormsModule,
    FeatherModule.pick(icons),
    CommonModule,
    DocumentViewerRoutingModule,
    NgxsModule.forFeature([
      DocumentViewerState,
    ]),
  ],
})
export class DocumentViewerModule {}
