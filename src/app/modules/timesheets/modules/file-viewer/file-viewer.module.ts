import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FileViewerComponent } from './file-viewer.component';
import { FeatherModule } from 'angular-feather';
import { Maximize2, Minimize2, X, Download } from 'angular-feather/icons';
import { DialogModule } from '@syncfusion/ej2-angular-popups';
import { PdfViewerModule } from '@syncfusion/ej2-angular-pdfviewer';
import { ButtonModule } from '@syncfusion/ej2-angular-buttons';

@NgModule({
  declarations: [
    FileViewerComponent,
  ],
  imports: [
    CommonModule,
    FeatherModule.pick({
      Download,
      Maximize2,
      Minimize2,
      X,
    }),
    DialogModule,
    PdfViewerModule,
    ButtonModule,

  ],
  exports: [
    FileViewerComponent,
  ]
})
export class FileViewerModule { }
