import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { ButtonModule } from '@syncfusion/ej2-angular-buttons';
import { FeatherModule } from 'angular-feather';
import { Plus } from 'angular-feather/icons';

import { WorkflowStepsListComponent } from './workflow-steps-list.component';
import { WorkflowStateService } from '@organization-management/workflow/services';
import { ValidateDirectiveModule } from '@shared/directives/validate-directive/validate-directive.module';
import { WorkflowStepsService } from '@organization-management/workflow/components/workflow-steps-list/services';

@NgModule({
  declarations: [
    WorkflowStepsListComponent,
  ],
  exports: [
    WorkflowStepsListComponent,
  ],
  imports: [
    CommonModule,
    ButtonModule,
    FeatherModule.pick({ Plus }),
    ValidateDirectiveModule,
    ReactiveFormsModule,
  ],
  providers: [WorkflowStateService, WorkflowStepsService],
})
export class WorkflowStepsListModule {}
