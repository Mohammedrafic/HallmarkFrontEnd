import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Store } from '@ngxs/store';

import { WorkflowWithDetails } from '@shared/models/workflow.model';
import { WorkflowNavigationTabs } from '@organization-management/workflow/enumns';
import { SaveWorkflow } from '@organization-management/store/workflow.actions';
import { WorkflowGroupType } from '@shared/enums/workflow-group-type';

@Injectable()
export class CreateWorkflowService {
  constructor(
    private formBuilder: FormBuilder,
    private store: Store,
  ) {}

  public createWorkflowForm(): FormGroup {
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
    const workflowWithDetails: WorkflowWithDetails = {
      name: workflowForm.controls['workflow'].value,
      type: workflowType,
      isIRP: selectedTab === WorkflowNavigationTabs.IrpOrderWorkFlow,
    };

    this.store.dispatch(new SaveWorkflow(workflowWithDetails));

    workflowForm.reset();
  }
}
