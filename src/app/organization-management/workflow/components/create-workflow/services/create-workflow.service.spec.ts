import { TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Store } from '@ngxs/store';

import { CreateWorkflowService } from '@organization-management/workflow/components/create-workflow/services/create-workflow.service';
import { ApplicabilityValidator } from '@organization-management/workflow/components/create-workflow/validators';
import { WorkflowNavigationTabs } from '@organization-management/workflow/enumns';
import { SaveEditedWorkflow } from '@organization-management/store/workflow.actions';
import { WorkflowGroupType } from '@shared/enums/workflow-group-type';

describe('CreateWorkflowService', () => {
  let service: CreateWorkflowService;
  let fb: FormBuilder;
  const storeSpy = jasmine.createSpyObj('Store', ['dispatch']);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      providers: [
        CreateWorkflowService,
        FormBuilder,
        { provide: Store, useValue: storeSpy },
      ],
    });

    service = TestBed.inject(CreateWorkflowService);
    fb = TestBed.inject(FormBuilder);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('createWorkflowForm - should create a form for VmsOrderWorkFlow tab', () => {
    const expectedForm = fb.group({
      id: [null],
      workflow: [null, [Validators.required, Validators.maxLength(50)]],
      initialOrders: [false],
      extensions: [false],
    }, { validator: ApplicabilityValidator });
    const resultForm = service.createWorkflowForm(WorkflowNavigationTabs.VmsOrderWorkFlow);

    expect(resultForm.value).toEqual(expectedForm.value);
  });

  it('should create a form for other tabs', () => {
    const expectedForm = fb.group({
      workflow: [null, [Validators.required, Validators.maxLength(50)]],
    });
    const resultForm = service.createWorkflowForm(WorkflowNavigationTabs.IrpOrderWorkFlow);

    expect(resultForm.value).toEqual(expectedForm.value);
  });

  it('should mark all fields as touched when form is invalid', () => {
    const mockForm = fb.group({
      workflow: [null, [Validators.required, Validators.maxLength(50)]],
    });

    spyOn(mockForm, 'markAllAsTouched');

    service.saveWorkflow(WorkflowNavigationTabs.IrpOrderWorkFlow, mockForm);

    expect(mockForm.markAllAsTouched).toHaveBeenCalled();
  });

   it('should save edited workflow when form is valid', () => {
    const mockForm = fb.group({
      id: [1],
      initialOrders: [false],
      extensions: [false],
      workflow: ['Sample Workflow', [Validators.required, Validators.maxLength(50)]],
    });
    const resetSpy = spyOn(mockForm, 'reset');
    const saveDetailsDto = {
      id: 1,
      name: 'Sample Workflow',
      type: WorkflowGroupType.IRPOrderWorkflow,
      initialOrders: false,
      extensions: false,
      isIRP: true,
    }

    service.saveWorkflow(WorkflowNavigationTabs.IrpOrderWorkFlow, mockForm);

     expect(resetSpy).toHaveBeenCalled();
     expect(storeSpy.dispatch).toHaveBeenCalledOnceWith(new SaveEditedWorkflow(saveDetailsDto));
  });
});
