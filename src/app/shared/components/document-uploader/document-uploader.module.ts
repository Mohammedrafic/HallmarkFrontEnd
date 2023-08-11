import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UploaderModule } from '@syncfusion/ej2-angular-inputs';
import { FeatherModule } from 'angular-feather';

import { DocumentUploaderComponent } from './document-uploader.component';
import { FormatBytesModule } from '@shared/pipes/format-bytes/format-bytes.module';

@NgModule({
  declarations: [DocumentUploaderComponent],
  exports: [DocumentUploaderComponent],
  imports: [CommonModule, UploaderModule, FeatherModule, FormatBytesModule],
})
export class DocumentUploaderModule {}
