import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard.components';
import { DashboardLayoutModule } from '@syncfusion/ej2-angular-layouts';
import { DashboardService } from './services/dashboard.service';
import { NgxsModule } from '@ngxs/store';
import { DashboardState } from './store/dashboard.state';
import { RouterModule } from '@angular/router';


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
