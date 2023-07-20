import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CardMenuModule } from '@organization-management/workflow/components/card-menu/card-menu.module';
import { CreateWorkflowModule } from '@organization-management/workflow/components/create-workflow/create-workflow.module';
import {
  WorkflowStepsListModule,
} from '@organization-management/workflow/components/workflow-steps-list/workflow-steps-list.module';
import { IrpOrderWorkflowComponent } from './irp-order-workflow.component';
import { WorkflowStateService } from '@organization-management/workflow/services';

@NgModule({
  declarations: [
    IrpOrderWorkflowComponent,
  ],
  exports: [
    IrpOrderWorkflowComponent,
  ],
  imports: [
    CommonModule,
    CardMenuModule,
    CreateWorkflowModule,
    WorkflowStepsListModule,
  ],
  providers: [WorkflowStateService],
})
export class IrpOrderWorkflowModule {}
