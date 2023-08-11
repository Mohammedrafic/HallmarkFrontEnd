import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileListComponent } from './file-list.component';
import { FeatherModule } from 'angular-feather';
import { ButtonModule } from '@syncfusion/ej2-angular-buttons';
import { FormatBytesModule } from '@shared/pipes/format-bytes/format-bytes.module';
import { OrderFileService } from './service/download-file.service';



@NgModule({
  declarations: [
    FileListComponent,
  ],
  exports: [
    FileListComponent,
  ],
  imports: [
    CommonModule,
    FeatherModule,
    ButtonModule,
    FormatBytesModule,
  ],
  providers: [OrderFileService],
})
export class FileListModule { }
