import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PageService, ResizeService } from '@syncfusion/ej2-angular-grids';
import { NgxsModule } from '@ngxs/store';

import { SideMenuModule } from '@shared/components/side-menu/side-menu.module';
import { TIER_DIALOG_TYPE } from '@shared/components/tiers-dialog/constants';
import { Tiers } from '@shared/enums/tiers.enum';
import { SideMenuService } from '@shared/components/side-menu/services';
import { WorkCommitmentApiService } from '@shared/services/work-commitment-api.service';

import { OrganizationManagementState } from './store/organization-management.state';
import { CredentialsState } from './store/credentials.state';
import { ShiftsState } from './store/shifts.state';
import { OrganizationManagementComponent } from './organization-management.component';
import { OrganizationManagementRoutingModule } from './organization-management-routing.module';
import { HolidaysState } from './store/holidays.state';
import { WorkflowState } from './store/workflow.state';
import { BillRatesState } from './store/bill-rates.state';
import { SpecialProjectState } from './store/special-project.state';
import { PurchaseOrderState } from './store/purchase-order.state';
import { SpecialProjectCategoryState } from './store/special-project-category.state';
import { SpecialProjectMappingState } from './store/special-project-mapping.state';
import { PurchaseOrderMappingState } from './store/purchase-order-mapping.state';
import { BusinessLinesState } from './store/business-lines.state';
import { TiersState } from './store/tiers.state';
import { SettingsViewService, TiersApiService } from '@shared/services';
import { SkillsState } from './store/skills.state';
import { WorkCommitmentState } from './store/work-commitment.state';
import { PayRatesState } from './store/pay-rates.state';

@NgModule({
  declarations: [OrganizationManagementComponent],
  imports: [
    CommonModule,
    OrganizationManagementRoutingModule,
    SideMenuModule,

    //STORE
    NgxsModule.forFeature([
      OrganizationManagementState,
      WorkflowState,
      CredentialsState,
      ShiftsState,
      HolidaysState,
      BillRatesState,
      SpecialProjectState,
      PurchaseOrderState,
      SpecialProjectCategoryState,
      SpecialProjectMappingState,
      PurchaseOrderMappingState,
      BusinessLinesState,
      TiersState,
      SkillsState,
      WorkCommitmentState,
      PayRatesState,
    ]),
  ],
  providers: [
    ResizeService,
    PageService,
    TiersApiService,
    WorkCommitmentApiService,
    SideMenuService,
    SettingsViewService,
    {
      provide: TIER_DIALOG_TYPE,
      useValue: Tiers.tierSettings,
    },
  ],
})
export class OrganizationManagementModule {}
