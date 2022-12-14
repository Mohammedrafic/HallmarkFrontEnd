import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { TooltipModule } from '@syncfusion/ej2-angular-popups';
import { FileUploaderModule } from '../file-uploader/file-uploader.module';
import { UploadFileAreaComponent } from './upload-file-area.component';

@NgModule({
  imports: [FileUploaderModule, TooltipModule, SharedModule],
  declarations: [UploadFileAreaComponent],
  exports: [UploadFileAreaComponent]
})
export class UploadFileAreaModule {}
