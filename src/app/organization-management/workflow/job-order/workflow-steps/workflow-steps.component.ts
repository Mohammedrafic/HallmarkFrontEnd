import { Component, EventEmitter, Inject, Input, OnInit, OnDestroy, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Step, Workflow } from '@shared/models/workflow.model';
import { Subject, take, takeUntil } from 'rxjs';
import { WorkflowStepType } from '@shared/enums/workflow-step-type';
import { WorkflowType } from '@shared/enums/workflow-type';
import { filter } from 'rxjs/operators';
import { DELETE_RECORD_TEXT, DELETE_RECORD_TITLE } from '@shared/constants';
import { ConfirmService } from '@shared/services/confirm.service';
import { Actions, ofActionSuccessful } from '@ngxs/store';
import { RemoveWorkflowDeclined } from '../../../store/workflow.actions';
import { UserPermissions } from "@core/enums";
import { Permission } from "@core/interface";

@Component({
  selector: 'app-workflow-steps',
  templateUrl: './workflow-steps.component.html',
  styleUrls: ['./workflow-steps.component.scss']
})
export class WorkflowStepsComponent implements OnInit, OnDestroy {
  @Input() workflow: Workflow;
  @Input() workflowSteps$: Subject<Step[]>;
  @Input() customStepFormGroup: FormGroup;
  @Input() userPermission: Permission;

  @Output() customStepAddClick = new EventEmitter;
  @Output() customStepRemoveClick = new EventEmitter;

  public initialSteps: Step[];
  public steps: Step[];
  public workflowTypeName = '';
  public incompleteShortlistedStepName: string;
  public incompleteShortlistedStepStatus: string;
  public publishedOfferedStepName: string;
  public publishedOfferedStepStatus: string;
  public onboardedStepName: string;
  public onboardedStepStatus: string;
  public shortlistedIsAgencyStep: boolean;
  public offeredIsAgencyStep: boolean;
  public onboardedIsAgencyStep: boolean;
  public readonly userPermissions = UserPermissions;

  get customStepStatus() {
    return this.customStepFormGroup.get('customStepStatus') as FormArray;
  }

  get customStepName() {
    return this.customStepFormGroup.get('customStepName') as FormArray;
  }

  get showAddCustomStep(): boolean {
    return this.shortlistedCanBeFollowedByCustomStep || this.incompleteCanBeFollowedByCustomStep;
  }

  private formBuilder: FormBuilder;
  private unsubscribe$: Subject<void> = new Subject();
  private shortlistedCanBeFollowedByCustomStep: boolean;
  private incompleteCanBeFollowedByCustomStep: boolean;

  constructor(@Inject(FormBuilder) private builder: FormBuilder,
              private actions$: Actions,
              private confirmService: ConfirmService) {
    this.formBuilder = builder;
  }

  ngOnInit(): void {
    this.workflowSteps$.pipe(filter(Boolean),takeUntil(this.unsubscribe$)).subscribe((steps: Step[]) => {
      this.setStepNameAndStatus(this.workflow);
      this.initialSteps = steps.map(s => s); // make a copy of steps to use them in case update will fail
      this.steps = steps;

      // remove steps that were added but not saved during workflows switching
      const emptyLeftOverStep = steps.find(s => s.status === '' && s.name === '');
      if (emptyLeftOverStep) {
        this.steps.splice(this.steps.indexOf(emptyLeftOverStep), 1);
      }

      this.customStepName.clear();
      this.customStepStatus.clear();

      if (this.steps.filter(s => s.type === WorkflowStepType.Custom).length > 0) { // check if there are custom steps
        this.steps.forEach((item) => {
          if (item.type === WorkflowStepType.Custom) {
            this.customStepName.push(this.formBuilder.control(item.name, [Validators.required, Validators.maxLength(50)]));
            this.customStepStatus.push(this.formBuilder.control(item.status, [Validators.required, Validators.maxLength(50)]));
          }
        });
      }
    });

    this.actions$.pipe(takeUntil(this.unsubscribe$), ofActionSuccessful(RemoveWorkflowDeclined)).subscribe(() => {
      this.steps = this.initialSteps;
      this.workflow.steps = this.initialSteps;
      this.customStepName.clear();
      this.customStepStatus.clear();

      this.steps.forEach((item) => {
        if (item.type === WorkflowStepType.Custom) {
          this.customStepName.push(this.formBuilder.control(item.name, [Validators.required, Validators.maxLength(50)]));
          this.customStepStatus.push(this.formBuilder.control(item.status, [Validators.required, Validators.maxLength(50)]));
        }
      });
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public onAddCustomStepClick(): void {
    this.addChildStepDetails();
  }

  public onRemoveCustomStepButtonClick(index: number): void {
    this.confirmService
      .confirm(DELETE_RECORD_TEXT, {
        title: DELETE_RECORD_TITLE,
        okButtonLabel: 'Delete',
        okButtonClass: 'delete-button'
      }).pipe(
        filter(confirm => !!confirm),
        take(1)
      ).subscribe(() => {
        const notCustomSteps = this.steps.filter(s => s.type !== WorkflowStepType.Custom); // preserve all non-custom steps
        this.steps = this.steps.filter(s => s.type === WorkflowStepType.Custom);
        this.steps.splice(index, 1); // remove custom step by its index

        if (this.steps.filter(s => s.type === WorkflowStepType.Custom).length === 0) {
          this.steps = []; // if no custom steps, overridden parent status also not need so empty array at all
        }

        this.steps = notCustomSteps.concat(this.steps);
        this.workflow.steps = this.steps;

        this.customStepName.removeAt(index);
        this.customStepStatus.removeAt(index);

        this.customStepRemoveClick.emit();
      });
  }

  private addChildStepDetails(): void {
    const newCustomStep: Step = {
      name: '',
      status: '',
      type: WorkflowStepType.Custom,
      workflowId: this.workflow.id
    }
    this.steps.push(newCustomStep);
    this.customStepName.push(this.formBuilder.control('', [Validators.required, Validators.maxLength(50)]));
    this.customStepStatus.push(this.formBuilder.control('', [Validators.required, Validators.maxLength(50)]));
  }

  private setStepNameAndStatus(workflow: Workflow): void {
    if (workflow.type === WorkflowType.OrderWorkflow) {
      this.workflowTypeName = 'Order Workflow';

      const incompleteStep = workflow.steps.find(step => step.type === WorkflowStepType.Incomplete);
      if (incompleteStep) {
        this.incompleteShortlistedStepName = incompleteStep.name;
        this.incompleteShortlistedStepStatus = incompleteStep.status;
        this.incompleteCanBeFollowedByCustomStep = incompleteStep.canBeFollowedByCustomStep as boolean;
      }

      const publishedStep = workflow.steps.find(step => step.type === WorkflowStepType.Published);
      if (publishedStep) {
        this.publishedOfferedStepName = publishedStep.name;
        this.publishedOfferedStepStatus = publishedStep.status;
      }
    } else {
      this.workflowTypeName = 'Application Workflow';
      const shortlistedStep = workflow.steps.find(step => step.type === WorkflowStepType.Shortlisted);
      if (shortlistedStep) {
        this.incompleteShortlistedStepName = shortlistedStep.name;
        this.incompleteShortlistedStepStatus = shortlistedStep.status;
        this.shortlistedCanBeFollowedByCustomStep = shortlistedStep.canBeFollowedByCustomStep as boolean;
        this.shortlistedIsAgencyStep = shortlistedStep.isAgencyStep as boolean;
      }

      const offeredStep = workflow.steps.find(step => step.type === WorkflowStepType.Offered);
      if (offeredStep) {
        this.publishedOfferedStepName = offeredStep.name;
        this.publishedOfferedStepStatus = offeredStep.status;
        this.offeredIsAgencyStep = offeredStep.isAgencyStep as boolean;
      }

      const onboardedStep = workflow.steps.find(step => step.type === WorkflowStepType.Onboarded);
      if (onboardedStep) {
        this.onboardedStepName = onboardedStep.name;
        this.onboardedStepStatus = onboardedStep.status;
        this.onboardedIsAgencyStep = onboardedStep.isAgencyStep as boolean;
      }
    }
  }
}
