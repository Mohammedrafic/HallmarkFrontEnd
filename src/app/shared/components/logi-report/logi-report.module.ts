import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogiReportComponent } from './logi-report.component';



@NgModule({
  declarations: [LogiReportComponent],
  imports: [
    CommonModule
  ],
  exports: [LogiReportComponent]
})
export class LogiReportModule { }
