import { NgModule } from '@angular/core';
import { DocumentUploaderComponent } from './document-uploader.component';
import { CommonModule } from '@angular/common';
import { UploaderModule } from '@syncfusion/ej2-angular-inputs';
import { FeatherModule } from 'angular-feather';

@NgModule({
  declarations: [DocumentUploaderComponent],
  exports: [DocumentUploaderComponent],
  imports: [CommonModule, UploaderModule, FeatherModule],
})
export class DocumentUploaderModule {}
