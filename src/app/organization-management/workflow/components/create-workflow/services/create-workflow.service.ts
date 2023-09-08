import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Store } from '@ngxs/store';

import { WorkflowWithDetails } from '@shared/models/workflow.model';
import { WorkflowNavigationTabs } from '@organization-management/workflow/enumns';
import { SaveWorkflow } from '@organization-management/store/workflow.actions';
import { WorkflowGroupType } from '@shared/enums/workflow-group-type';
import {
  ApplicabilityValidator,
} from '@organization-management/workflow/components/create-workflow/validators';

@Injectable()
export class CreateWorkflowService {
  constructor(
    private formBuilder: FormBuilder,
    private store: Store,
  ) {}

  public createWorkflowForm(
    tab: WorkflowNavigationTabs,
    isEdit = false,
    card?: WorkflowWithDetails
  ): FormGroup {
    if(tab === WorkflowNavigationTabs.VmsOrderWorkFlow) {
      return this.formBuilder.group({
        id: [isEdit ? card?.id: null],
        workflow: [isEdit ? card?.name : null, [Validators.required, Validators.maxLength(50)]],
        initialOrders: [isEdit ? card?.initialOrders : false],
        extensions: [isEdit ? card?.extensions : false],
      }, { validator: ApplicabilityValidator});
    }

    return this.formBuilder.group({
      workflow: [null, [Validators.required, Validators.maxLength(50)]],
    });
  }

  public saveWorkflow(
    selectedTab: WorkflowNavigationTabs,
    workflowForm: FormGroup,
  ): void {
    if (workflowForm.valid) {
      this.saveWorkflowBaseOnSystem(selectedTab,workflowForm);
    } else {
      workflowForm.markAllAsTouched();
    }
  }

  private saveWorkflowBaseOnSystem(
    selectedTab: WorkflowNavigationTabs,
    workflowForm: FormGroup
  ): void {
    const workflowType = selectedTab === WorkflowNavigationTabs.IrpOrderWorkFlow ?
      WorkflowGroupType.IRPOrderWorkflow : WorkflowGroupType.VMSOrderWorkflow;
    const {id,workflow, initialOrders, extensions} = workflowForm.value;
    const workflowWithDetails: WorkflowWithDetails = {
      id,
      name: workflow,
      type: workflowType,
      initialOrders,
      extensions,
      isIRP: selectedTab === WorkflowNavigationTabs.IrpOrderWorkFlow,
    };

    this.store.dispatch(new SaveWorkflow(workflowWithDetails));

    workflowForm.reset();
  }
}
