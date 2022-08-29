import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileUploaderComponent } from '@shared/components/file-uploader/file-uploader.component';
import { UploaderModule } from '@syncfusion/ej2-angular-inputs';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    FileUploaderComponent,
  ],
  exports: [
    FileUploaderComponent
  ],
  imports: [
    CommonModule,
    UploaderModule,
    ReactiveFormsModule
  ]
})
export class FileUploaderModule { }
