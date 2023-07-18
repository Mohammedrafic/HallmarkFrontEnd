import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { Subject } from 'rxjs';

import { WorkflowNavigationTabs } from '@organization-management/workflow/enumns';

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

  public createTabList(featureFlag: boolean, system: boolean): WorkflowNavigationTabs[] {
    if(featureFlag && system) {
      return [
        WorkflowNavigationTabs.IrpOrderWorkFlow,
        WorkflowNavigationTabs.VmsOrderWorkFlow,
        WorkflowNavigationTabs.WorkflowMapping,
      ];
    }

    return [
      WorkflowNavigationTabs.VmsOrderWorkFlow,
      WorkflowNavigationTabs.WorkflowMapping,
    ];
  }
}
