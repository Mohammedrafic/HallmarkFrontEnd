import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { DashboardLayoutModule } from '@syncfusion/ej2-angular-layouts';
import { NgxsModule } from '@ngxs/store';

import { DashboardState } from './store/dashboard.state';
import { DashboardService } from './services/dashboard.service';
import { DashboardComponent } from './dashboard.components';


@NgModule({
  declarations: [DashboardComponent],
  imports: [
    CommonModule,
    DashboardLayoutModule,
    RouterModule.forChild([{path: '', component: DashboardComponent}]),
    NgxsModule.forFeature([DashboardState]),
  ],
  providers: [DashboardService]
})
export class DashboardModule { }
