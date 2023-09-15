import { FormArray, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TestBed } from '@angular/core/testing';

import { JobOrderService } from '@organization-management/workflow/job-order/services/job-order.service';
import { WorkflowNavigationTabs } from '@organization-management/workflow/enumns';

describe('JobOrderService', () => {
  let service: JobOrderService;
  let fb: FormBuilder;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      providers: [
        JobOrderService,
        FormBuilder,
      ],
    });

    service = TestBed.inject(JobOrderService);
    fb = TestBed.inject(FormBuilder);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('createCustomStepForm() - should create a custom step form with empty arrays', () => {
    const resultForm = service.createCustomStepForm();

    expect(resultForm).toBeTruthy();
    expect(resultForm.get('customParentStatus') instanceof FormArray).toBeTruthy();
    expect(resultForm.get('customStepStatus') instanceof FormArray).toBeTruthy();
    expect(resultForm.get('customStepName') instanceof FormArray).toBeTruthy();
  });

  it('createTabList - should create tab list with WorkflowMapping when no feature flag and no VMS', () => {
    const featureFlag = false;
    const systemFlags = {
      isVMCEnabled: false,
      isIRPEnabled: false,
    };
    const tabs = service.createTabList(featureFlag, systemFlags);

    expect(tabs).toEqual([WorkflowNavigationTabs.WorkflowMapping]);
  });

  it('createTabList - should create tab list with WorkflowMapping and VmsOrderWorkFlow when VMS is enabled', () => {
    const featureFlag = false;
    const systemFlags = {
      isVMCEnabled: true,
      isIRPEnabled: false,
    };
    const tabs = service.createTabList(featureFlag, systemFlags);

    expect(tabs).toEqual([WorkflowNavigationTabs.VmsOrderWorkFlow, WorkflowNavigationTabs.WorkflowMapping]);
  });

  it('createTabList - should create tab list with WorkflowMapping and IrpOrderWorkFlow when feature flag and IRP are enabled', () => {
    const featureFlag = true;
    const systemFlags = {
      isVMCEnabled: false,
      isIRPEnabled: true,
    };

    const tabs = service.createTabList(featureFlag, systemFlags);

    expect(tabs).toEqual([WorkflowNavigationTabs.IrpOrderWorkFlow, WorkflowNavigationTabs.WorkflowMapping]);
  });

  it('createTabList - should create tab list with WorkflowMapping, VmsOrderWorkFlow, and IrpOrderWorkFlow when both feature flag and VMC/IRP are enabled', () => {
    const featureFlag = true;
    const systemFlags = {
      isVMCEnabled: true,
      isIRPEnabled: true,
    };

    const tabs = service.createTabList(featureFlag, systemFlags);

    expect(tabs).toEqual([
      WorkflowNavigationTabs.IrpOrderWorkFlow,
      WorkflowNavigationTabs.VmsOrderWorkFlow,
      WorkflowNavigationTabs.WorkflowMapping,
    ]);
  });
});
