import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TooltipModule } from '@syncfusion/ej2-angular-popups';

import { FileUploaderModule } from '../file-uploader/file-uploader.module';
import { UploadFileAreaComponent } from './upload-file-area.component';
import { SharedModule } from '@shared/shared.module';


@NgModule({
  imports: [FileUploaderModule, TooltipModule, SharedModule, CommonModule],
  declarations: [UploadFileAreaComponent],
  exports: [UploadFileAreaComponent],
})
export class UploadFileAreaModule {}
