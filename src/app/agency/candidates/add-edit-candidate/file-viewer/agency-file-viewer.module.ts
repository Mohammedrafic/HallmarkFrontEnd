import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileViewerComponent } from '@agency/candidates/add-edit-candidate/file-viewer/file-viewer.component';
import { DialogModule } from '@syncfusion/ej2-angular-popups';
import { ButtonModule } from '@syncfusion/ej2-angular-buttons';
import { FeatherModule } from 'angular-feather';
import { ListBoxModule } from '@syncfusion/ej2-angular-dropdowns';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { ReactiveFormsModule } from '@angular/forms';
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
  ZoomOut
} from 'angular-feather/icons';

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
    ListBoxModule,
    PdfViewerModule,
    ReactiveFormsModule,
    FeatherModule.pick(icons),
  ],
  exports: [FileViewerComponent],
})
export class AgencyFileViewerModule {}
