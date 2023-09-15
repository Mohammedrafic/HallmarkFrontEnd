import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TestBed } from '@angular/core/testing';

import { WorkflowStepsService } from '@organization-management/workflow/components/workflow-steps-list/services/workflow-steps.service';
import { WorkflowStateService } from '@organization-management/workflow/services';
import { CustomStepType } from '@organization-management/workflow/components/create-workflow/constants';
import { Step, Workflow, WorkflowList, WorkflowWithDetails } from '@shared/models/workflow.model';
import { TypeFlow } from '@organization-management/workflow/enumns';

class WorkflowStateStubService {
  getSelectedCard(): WorkflowWithDetails {
    return {
      id: 123,
      name: 'Test Workflow',
    } as WorkflowWithDetails;
  }
}

describe('WorkflowStepsService', () => {
  let service: WorkflowStepsService;
  let fb: FormBuilder;

  const step: Step = {
    id: 1,
    name: 'Test Step',
    status: 'In Progress',
    type: CustomStepType,
    workflowId: 123,
    order: 1,
    formStepName: 'step1',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      providers: [
        WorkflowStepsService,
        FormBuilder,
        { provide: WorkflowStateService, useClass: WorkflowStateStubService }
      ]
    });

    service = TestBed.inject(WorkflowStepsService);
    fb = TestBed.inject(FormBuilder);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('createCustomWorkflowForm - should create a custom workflow form', () => {
    const form = service.createCustomWorkflowForm();

    expect(form).toBeTruthy();
    expect(form.getRawValue()).toEqual({});
  });

  it('createStepControl - should create a step control in the form', () => {
    const form = fb.group({});
    const isCustomStep = true;

    service.createStepControl(form, step, isCustomStep);

    expect(form.contains('step1')).toBeTruthy();
  });

  it('createStepForm - should create a step form', () => {
    const form = fb.group({});
    const isCustomStep = true;

    const stepForm = service.createStepForm(form, step, isCustomStep);

    expect(stepForm).toBeTruthy();
    expect(stepForm.get('id')?.value).toBe(1);
    expect(stepForm.get('name')?.value).toBe('Test Step');
    expect(stepForm.get('status')?.value).toBe('In Progress');
    expect(stepForm.get('type')?.value).toBe(CustomStepType);
    expect(stepForm.get('workflowId')?.value).toBe(123);
    expect(stepForm.get('order')?.value).toBe(1);
  });

  it('createWorkflowDetailsDto - should create a WorkflowWithDetailsPut object', () => {
    const stepForm = fb.group({
      step1: [
        {
          id: 1,
          name: 'Test Step 1',
          status: 'In Progress',
          type: 'Custom',
          workflowId: 123,
          order: 1,
        },
        {
          id: 2,
          name: 'Test Step 2',
          status: 'Completed',
          type: 'Custom',
          workflowId: 123,
          order: 2,
        },
      ],
    });
    const createdDetails = service.createWorkflowDetailsDto(stepForm);


    expect(createdDetails.id).toBe(123);
    expect(createdDetails.isIRP).toBe(true);
    expect(createdDetails.name).toBe('Test Workflow');
  });

  it('getWorkflowWithCustomSteps - should get WorkflowWithCustomSteps', () => {
    const workflow = {
      orderWorkflow: {
        steps: [
          { id: 1, name: 'Step 1', type: 'Default' },
          { id: 2, name: 'Step 2', type: CustomStepType },
        ],
      },
      applicationWorkflow: {
        steps: [
          { id: 3, name: 'Step 3', type: CustomStepType },
          { id: 4, name: 'Step 4', type: 'Default' },
        ],
      },
    };

    const result: Step[] = service.getWorkflowWithCustomSteps(workflow as WorkflowList);

    expect(result.length).toBe(2);
    expect(result.every(step => step.type === CustomStepType)).toBeTrue();
  });

  it('getWorkflowWithCustomSteps - should return an empty array when there are no custom steps', () => {
    const workflow = {
      orderWorkflow: {},
      applicationWorkflow: {},
    } as WorkflowList;
    const result: Step[] = service.getWorkflowWithCustomSteps(workflow);

    expect(result.length).toBe(0);
  });

  it('getDefaultWorkflowList - should get Default Workflow List', () => {
    const workflow = {
      id: 1,
      steps: [
        { id: 1, name: 'Step 1', type: 2 },
        { id: 2, name: 'Step 2', type: CustomStepType },
        { id: 3, name: 'Step 3', type: 2 },
      ],
    } as Workflow;

    const result = service.getDefaultWorkflowList(workflow, TypeFlow.orderWorkflow);

    expect(result.steps.length).toBe(2);
    expect(result.steps.every(step => step.type === 2)).toBeTrue();
    expect(result.id).toBe(1);
  });

  it('getDefaultWorkflowList - should return the same workflow when there are no custom steps', () => {
    const workflow = {
      id: 2,
      steps: [
        { id: 4, name: 'Step 4', type: 0 },
        { id: 5, name: 'Step 5', type: 0 },
      ],
    } as Workflow;

    const result: Workflow = service.getDefaultWorkflowList(workflow, TypeFlow.applicationWorkflow);

    expect(result).toEqual(workflow);
  });

  it('prepareWorkflowList - should prepare Workflow List', () => {
    const workflowWithDetails = {
      id: 1,
      name: 'test',
      type: 1,
      isIRP: false,
      workflows: [
        {
          id: 101,
          type: 1,
          workflowId: 1,
          steps: [
            { id: 1, name: 'Step 1', type: 0 },
            { id: 2, name: 'Step 2', type: 0 },
          ],
        },
        {
          id: 102,
          type: 1,
          workflowId: 1,
          steps: [
            { id: 3, name: 'Step 3', type: 1 },
            { id: 4, name: 'Step 4', type: 1 },
          ],
        },
      ],
    };

    const result: WorkflowList | null = service.prepareWorkflowList(workflowWithDetails as WorkflowWithDetails);


   expect(result?.orderWorkflow?.type).toBe(1);
    expect(result?.applicationWorkflow?.type).toBe(1);

    expect(result?.orderWorkflow?.steps[0].formStepName).toBe('step1');
    expect(result?.orderWorkflow?.steps[1].formStepName).toBe('step2');
    expect(result?.applicationWorkflow?.steps[0].formStepName).toBe('step3');
    expect(result?.applicationWorkflow?.steps[1].formStepName).toBe('step4');
  });

  it('prepareWorkflowList - should return null when there are no workflows', () => {
    const workflowWithDetails = {
      id: 1,
      name: 'Empty Workflow',
      type: 1,
      initialOrders: false,
      extensions: false,
      isIRP: false,
      workflows: [],
    } as WorkflowWithDetails;

    const result: WorkflowList | null = service.prepareWorkflowList(workflowWithDetails);

    expect(result).toBeNull();
  });
});
