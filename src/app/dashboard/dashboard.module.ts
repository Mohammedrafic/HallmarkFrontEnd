import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard.components';
import { DashboardLayoutModule } from '@syncfusion/ej2-angular-layouts';


@NgModule({
  declarations: [DashboardComponent],
  imports: [
    CommonModule,
    DashboardLayoutModule
  ]
})
export class DashboardModule { }
