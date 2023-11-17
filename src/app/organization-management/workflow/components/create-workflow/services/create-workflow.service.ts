import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Store } from '@ngxs/store';

import { WorkflowWithDetails } from '@shared/models/workflow.model';
import { ApplicabilityItemType, WorkflowNavigationTabs } from '@organization-management/workflow/enumns';
import { SaveEditedWorkflow, SaveWorkflow } from '@organization-management/store/workflow.actions';
import { WorkflowGroupType } from '@shared/enums/workflow-group-type';

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
      const applicabilityValue = isEdit && card?.extensions ? ApplicabilityItemType.Extension : ApplicabilityItemType.InitialOrder;

      return this.formBuilder.group({
        id: [isEdit ? card?.id: null],
        workflow: [isEdit ? card?.name : null, [Validators.required, Validators.maxLength(50)]],
        applicability: [applicabilityValue, [Validators.required]],
      });
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
    const { id,workflow, applicability } = workflowForm.getRawValue();

    const workflowWithDetails = {
      id,
      name: workflow,
      type: workflowType,
      initialOrders: selectedTab !== WorkflowNavigationTabs.IrpOrderWorkFlow ? !applicability : false,
      extensions: selectedTab !== WorkflowNavigationTabs.IrpOrderWorkFlow ? !!applicability : false,
      isIRP: selectedTab === WorkflowNavigationTabs.IrpOrderWorkFlow,
    };

    if (id) {
      this.store.dispatch(new SaveEditedWorkflow(workflowWithDetails));
    } else {
      this.store.dispatch(new SaveWorkflow(workflowWithDetails));
    }

    workflowForm.reset();
  }
}
