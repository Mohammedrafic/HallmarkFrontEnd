import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { Subject } from 'rxjs';

import { WorkflowNavigationTabs } from '@organization-management/workflow/enumns';
import { SystemFlags } from '@organization-management/workflow/interfaces';

@Injectable()
export class JobOrderService {
  public updateWorkflowStepsAction: Subject<boolean> = new Subject<boolean>();

  constructor( private formBuilder: FormBuilder) {}

  public createCustomStepForm(): FormGroup {
    return this.formBuilder.group({
      customParentStatus: this.formBuilder.array([]),
      customStepStatus: this.formBuilder.array([]),
      customStepName: this.formBuilder.array([]),
    });
  }

  public createTabList(featureFlag: boolean, systemFlags: SystemFlags): WorkflowNavigationTabs[] {
    const tabs = [WorkflowNavigationTabs.WorkflowMapping];

    if (systemFlags.isVMCEnabled) {
      tabs.unshift(WorkflowNavigationTabs.VmsOrderWorkFlow);
    }

    if (featureFlag && systemFlags.isIRPEnabled) {
      tabs.unshift(WorkflowNavigationTabs.IrpOrderWorkFlow);
    }

    return tabs;
  }
}
