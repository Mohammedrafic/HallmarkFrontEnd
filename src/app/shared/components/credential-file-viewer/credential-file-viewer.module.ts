import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { FeatherModule } from 'angular-feather';
import { DialogModule } from '@syncfusion/ej2-angular-popups';
import { ButtonModule, CheckBoxModule } from '@syncfusion/ej2-angular-buttons';
import { ListBoxModule } from '@syncfusion/ej2-angular-dropdowns';
import { MenuAllModule, SidebarModule, ToolbarModule } from '@syncfusion/ej2-angular-navigations';
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

import { FileViewerComponent } from './file-viewer.component';

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
  declarations: [FileViewerComponent],
  imports: [
    CommonModule,
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
  ],
  exports: [FileViewerComponent],
})
export class CredentialFileViewerModule {}
