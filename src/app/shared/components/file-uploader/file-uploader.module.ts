import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileUploaderComponent } from '@shared/components/file-uploader/file-uploader.component';
import { UploaderModule } from '@syncfusion/ej2-angular-inputs';

@NgModule({
  declarations: [
    FileUploaderComponent,
  ],
  exports: [
    FileUploaderComponent
  ],
  imports: [
    CommonModule,
    UploaderModule
  ]
})
export class FileUploaderModule { }
