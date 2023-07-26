import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ButtonModule, CheckBoxModule, SwitchModule } from '@syncfusion/ej2-angular-buttons';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { GridModule, PagerModule } from '@syncfusion/ej2-angular-grids';
import { NumericTextBoxModule } from '@syncfusion/ej2-angular-inputs';
import { TabAllModule, TabModule } from '@syncfusion/ej2-angular-navigations';
import { DialogModule } from '@syncfusion/ej2-angular-popups';
import { DropDownButtonModule } from '@syncfusion/ej2-angular-splitbuttons';
import { FeatherModule } from 'angular-feather';
import { Edit, Sliders, Trash2 } from 'angular-feather/icons';

import { TooltipContainerModule } from '@shared/components/tooltip-container/tooltip.module';
import { SharedModule } from '@shared/shared.module';

import { WorkflowMappingComponent } from './workflow-mapping/workflow-mapping.component';
import { WorkflowStepsComponent } from './job-order/workflow-steps/workflow-steps.component';
import { JobOrderComponent } from './job-order/job-order.component';
import { WorkflowRoutingModule } from './workflow-routing.module';
import { IrpOrderWorkflowModule } from '@organization-management/workflow/irp-order-workflow/irp-order-workflow.module';
import { CardMenuModule } from '@organization-management/workflow/components/card-menu/card-menu.module';
import {
  CreateWorkflowModule,
} from '@organization-management/workflow/components/create-workflow/create-workflow.module';
import { JobOrderService } from '@organization-management/workflow/job-order/services';
import { WorkflowMappingService } from '@organization-management/workflow/workflow-mapping/services';

const icons = {
  Sliders,
  Edit,
  Trash2,
};

@NgModule({
  declarations: [
    JobOrderComponent,
    WorkflowStepsComponent,
    WorkflowMappingComponent,
  ],
  imports: [
    CommonModule,
    WorkflowRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    PagerModule,
    GridModule,
    ButtonModule,
    DropDownListModule,
    CheckBoxModule,
    NumericTextBoxModule,
    DialogModule,
    TabModule,
    TabAllModule,
    SwitchModule,
    DropDownButtonModule,
    TooltipContainerModule,
    FeatherModule.pick(icons),
    IrpOrderWorkflowModule,
    CardMenuModule,
    CreateWorkflowModule,
  ],
  providers: [JobOrderService, WorkflowMappingService],
})
export class WorkflowModule {}
