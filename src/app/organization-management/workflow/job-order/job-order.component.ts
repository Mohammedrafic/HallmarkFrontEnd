import { Component, Inject, NgZone, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ShowSideDialog } from '../../../store/app.actions';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { filter, map, Observable, Subject, switchMap, take, takeUntil } from 'rxjs';
import { ConfirmService } from '@shared/services/confirm.service';
import { DELETE_RECORD_TEXT, DELETE_RECORD_TITLE } from '@shared/constants';
import {
  GetWorkflows,
  GetWorkflowsSucceed,
  PreviousSelectedWorkflow,
  RemoveWorkflow,
  RemoveWorkflowSucceed,
  UpdateWorkflow,
} from '../../store/workflow.actions';
import { Step, Workflow, WorkflowWithDetails, WorkflowWithDetailsPut } from '@shared/models/workflow.model';
import { ActivatedRoute } from '@angular/router';
import { WorkflowStepType } from '@shared/enums/workflow-step-type';
import { UserState } from '../../../store/user.state';
import {
  GetOrganizationById,
} from '@organization-management/store/organization-management.actions';
import { AbstractPermission } from '@shared/helpers/permissions';
import { SelectEventArgs } from '@syncfusion/ej2-angular-navigations';
import { WorkflowNavigationTabs } from '@organization-management/workflow/enumns';
import { JobOrderService } from '@organization-management/workflow/job-order/services';
import { OrganizationManagementState } from '@organization-management/store/organization-management.state';
import { AppState } from '../../../store/app.state';
import { WorkflowStateService } from '@organization-management/workflow/services';
import { Organization } from '@shared/models/organization.model';
import { GetSelectedCardIndex, PrepareCardInfo } from '@organization-management/workflow/helpers';
import { WorkflowTabNames } from '@organization-management/workflow/workflow-mapping/constants';
import { SystemFlags, WorkflowTabName } from '@organization-management/workflow/interfaces';
import { OutsideZone } from '@core/decorators';

@Component({
  selector: 'app-job-order',
  templateUrl: './job-order.component.html',
  styleUrls: ['./job-order.component.scss'],
})
export class JobOrderComponent extends AbstractPermission implements OnInit, OnDestroy {
  public activeTab: WorkflowNavigationTabs = WorkflowNavigationTabs.VmsOrderWorkFlow;
  public workflowsWithDetails: WorkflowWithDetails[] = [];
  public customStepOrderFormGroup: FormGroup;
  public customStepApplicationFormGroup: FormGroup;
  public selectedCard?: WorkflowWithDetails;
  public selectedIrpCard: WorkflowWithDetails | null;
  public orderWorkflow: Workflow;
  public applicationWorkflow: Workflow;
  public showCreateWorkflowDialog = false;
  public systemFlags: SystemFlags = {
    isIRPEnabled: false,
    isVMCEnabled: false,
  };
  public isIRPFlagEnabled = false;
  public customOrderSteps$: Subject<Step[]> = new Subject<Step[]>();
  public customApplicationSteps$: Subject<Step[]> = new Subject<Step[]>();
  public isEditWorkflowModal = false;

  public readonly workflowTab = WorkflowNavigationTabs;
  public readonly workflowTabNames: WorkflowTabName = WorkflowTabNames;

  @Select(UserState.lastSelectedOrganizationId)
  private organizationId$: Observable<number>;

  private formBuilder: FormBuilder;
  private unsubscribe$: Subject<void> = new Subject();
  private tabList: WorkflowNavigationTabs[];

  constructor(
    private actions$: Actions,
    protected override store: Store,
    private route: ActivatedRoute,
    @Inject(FormBuilder) private builder: FormBuilder,
    private confirmService: ConfirmService,
    private jobOrderService: JobOrderService,
    private workflowStateService: WorkflowStateService,
    private readonly ngZone: NgZone,
  ) {
    super(store);
    this.formBuilder = builder;
    this.createCustomOrderStepForm();
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.watchForChangeOrganization();
    this.watchForSucceedActionWorkflow();
    this.watchForSelectedIrpCard();
    this.watchForRemoveWorkflowAction();
    this.watchForPreviousSelectedWorkflow();
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public selectTab(selectedTab: SelectEventArgs): void {
    this.activeTab = this.tabList[selectedTab.selectedIndex];
    this.store.dispatch(new ShowSideDialog(false));

    this.orderWorkflowTab();
  }

  public saveWorkflowSteps(): void {
    if (this.activeTab === WorkflowNavigationTabs.IrpOrderWorkFlow) {
      this.jobOrderService.updateWorkflowStepsAction.next(true);
    } else {
      this.updateVmsWorkflowSteps();
    }
  }

  public closeCreateWorkflowModal(): void {
    this.isEditWorkflowModal = false;
    this.showCreateWorkflowDialog = false;
  }

  public onAddNewWorkflowClick(): void {
    this.isEditWorkflowModal = false;
    this.showCreateWorkflowDialog = true;
  }

  public selectCard(card: WorkflowWithDetails): void {
    if (card && card.workflows && card.workflows.length > 0) {
      this.workflowsWithDetails.forEach(card => card.isActive = false);

      card.isActive = true;
      this.selectedCard = card;
      this.orderWorkflow = card.workflows[0];
      this.applicationWorkflow = card.workflows[1];

      this.selectCustomCardStep();
    }
  }

  public removeCustomStep(): void {
    this.updateVmsWorkflowSteps(true);
  }

  public editWorkflow(): void {
    this.isEditWorkflowModal = true;
    this.showCreateWorkflowDialog = true;
  }

  public deleteWorkflow(): void {
    this.confirmService
      .confirm(DELETE_RECORD_TEXT, {
        title: DELETE_RECORD_TITLE,
        okButtonLabel: 'Delete',
        okButtonClass: 'delete-button',
      }).pipe(
      filter((confirm) => !!confirm),
      take(1)
    ).subscribe(() => {
      const isIRP = this.activeTab === WorkflowNavigationTabs.IrpOrderWorkFlow;
      const card = isIRP ? this.workflowStateService.getSelectedCard() : this.selectedCard;

      if (card) {
        card.isIRP = isIRP;
      }

      this.store.dispatch(new RemoveWorkflow(card as WorkflowWithDetails));
    });
  }

  private updateVmsWorkflowSteps(isRemoveStep = false): void {
    if (this.customStepOrderFormGroup.valid && this.customStepApplicationFormGroup.valid) {
      let orderSteps: Step[] = [];
      let applicationSteps: Step[] = [];

      if (this.orderWorkflow.steps.filter(s => s.type === WorkflowStepType.Custom).length > 0) {
        // map Order workflow custom steps
        this.orderWorkflow.steps.filter(s => s.type === WorkflowStepType.Custom).forEach((customStep, i) => {
          customStep.name = this.customStepOrderFormGroup.controls['customStepName'].value[i];
          customStep.status = this.customStepOrderFormGroup.controls['customStepStatus'].value[i];
          customStep.order = i + 1;
        });

        orderSteps = this.orderWorkflow.steps;
      }

      if (this.applicationWorkflow.steps.filter(s => s.type === WorkflowStepType.Custom).length > 0) {
        // map Application workflow custom steps
        this.applicationWorkflow.steps.filter(s => s.type === WorkflowStepType.Custom).forEach((customStep, i) => {
          customStep.name = this.customStepApplicationFormGroup.controls['customStepName'].value[i];
          customStep.status = this.customStepApplicationFormGroup.controls['customStepStatus'].value[i];
          customStep.order = i + 2;
        });

        applicationSteps = this.applicationWorkflow.steps;
      }

      const workflowWithDetailsPut: WorkflowWithDetailsPut = {
        id: (this.selectedCard as WorkflowWithDetails).id,
        isIRP: false,
        name: (this.selectedCard as WorkflowWithDetails).name,
        customSteps: orderSteps.concat(applicationSteps),
      };

      this.store.dispatch(new UpdateWorkflow(workflowWithDetailsPut, isRemoveStep));
    } else {
      this.customStepOrderFormGroup.markAllAsTouched();
      this.customStepApplicationFormGroup.markAllAsTouched();
    }
  }

  @OutsideZone
  private selectCustomCardStep(): void {
    setTimeout(() => {
      this.customOrderSteps$.next(this.orderWorkflow.steps);
      this.customApplicationSteps$.next(this.applicationWorkflow.steps);
    }, 300);
  }

  private createCustomOrderStepForm(): void {
    this.customStepOrderFormGroup = this.jobOrderService.createCustomStepForm();
    this.customStepApplicationFormGroup = this.jobOrderService.createCustomStepForm();
  }

  private watchForChangeOrganization(): void {
    this.organizationId$.pipe(
      switchMap((businessUnitId: number) => {
        return this.getOrganizationById(businessUnitId);
      }),
      filter(Boolean),
      takeUntil(this.unsubscribe$)
    ).subscribe(() => {
      this.checkOrgPreferences();
      this.selectedCard = undefined;
      this.selectedIrpCard = null;
    });
  }

  private getOrganizationById(businessUnitId: number): Observable<Organization> {
    const id = businessUnitId || this.store.selectSnapshot(UserState.user)?.businessUnitId as number;
    return this.store.dispatch(new GetOrganizationById(id));
  }

  private watchForPreviousSelectedWorkflow(): void {
    this.actions$.pipe(
      ofActionSuccessful(PreviousSelectedWorkflow),
      filter(({workflow}) => !!workflow && this.activeTab === WorkflowNavigationTabs.VmsOrderWorkFlow),
      takeUntil(this.componentDestroy()),
    ).subscribe(({workflow}) => {
      this.selectedCard = workflow;
    });
  }

  private watchForSucceedActionWorkflow(): void {
    this.actions$.pipe(
      filter(() => this.activeTab === WorkflowNavigationTabs.VmsOrderWorkFlow),
      ofActionSuccessful(GetWorkflowsSucceed),
      map((workflows) =>  PrepareCardInfo(workflows.payload)),
      takeUntil(this.unsubscribe$),
    ).subscribe((workflows) => {
      this.workflowsWithDetails = workflows;
      this.customStepOrderFormGroup.reset();
      this.customStepApplicationFormGroup.reset();

      if (this.selectedCard) {
        const index = GetSelectedCardIndex(this.workflowsWithDetails, this.selectedCard.id as number);
        this.selectCard(this.workflowsWithDetails[index]);
      } else {
        this.selectCard(this.workflowsWithDetails[0]);
      }
    });
  }

  private checkOrgPreferences(): void {
    const { isIRPEnabled, isVMCEnabled } =
    this.store.selectSnapshot(OrganizationManagementState.organization)?.preferences || {};

    this.isIRPFlagEnabled = this.store.selectSnapshot(AppState.isIrpFlagEnabled);
    this.systemFlags = {
      isIRPEnabled: isIRPEnabled ?? false,
      isVMCEnabled: isVMCEnabled ?? true,
    };
    this.tabList = this.jobOrderService.createTabList(this.isIRPFlagEnabled, this.systemFlags);
  }

  private orderWorkflowTab(): void {
    const isVmsTab = this.activeTab === WorkflowNavigationTabs.VmsOrderWorkFlow;
    const isIrpTab = this.activeTab === WorkflowNavigationTabs.IrpOrderWorkFlow;

    if (isVmsTab || isIrpTab) {
      this.store.dispatch(new GetWorkflows({
        includeInVMS: isVmsTab,
        includeInIRP: isIrpTab,
      }));
    }
  }

  private watchForRemoveWorkflowAction(): void {
    this.actions$.pipe(
      filter(() => this.activeTab === WorkflowNavigationTabs.VmsOrderWorkFlow),
      ofActionSuccessful(RemoveWorkflowSucceed),
      takeUntil(this.unsubscribe$),
    ).subscribe(() => {
      this.selectedCard = undefined;
    });
  }

  private watchForSelectedIrpCard(): void {
    this.workflowStateService.getCardStream().pipe(
      filter(() => this.activeTab === WorkflowNavigationTabs.IrpOrderWorkFlow),
      takeUntil(this.unsubscribe$),
    ).subscribe((card: WorkflowWithDetails | null) => {
      this.selectedIrpCard = card;
    });
  }
}
