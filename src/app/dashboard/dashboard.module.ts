import { NgxsModule } from '@ngxs/store';

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { DashboardComponent } from './dashboard.component';
import { DashboardControlModule } from './dashboard-control/dashboard-control.module';
import { DashboardService } from './services/dashboard.service';
import { DashboardState } from './store/dashboard.state';
import { DashboardWidgetsModule } from './dashboard-widgets/dashboard-widgets.module';
import { OrganizationManagementState } from '@organization-management/store/organization-management.state';
import { OrderManagementContentState } from '@client/store/order-managment-content.state';

@NgModule({
  declarations: [DashboardComponent],
  imports: [
    CommonModule,
    DashboardControlModule,
    RouterModule.forChild([{ path: '', component: DashboardComponent }]),
      NgxsModule.forFeature([DashboardState, OrganizationManagementState, OrderManagementContentState]),
    ReactiveFormsModule,
    DashboardWidgetsModule,
  ],
  providers: [DashboardService],
})
export class DashboardModule {}
