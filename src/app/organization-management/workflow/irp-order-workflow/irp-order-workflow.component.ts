import { Component, OnInit, ChangeDetectionStrategy, Input, ChangeDetectorRef } from '@angular/core';

import { filter, takeUntil } from 'rxjs';
import { Actions, ofActionSuccessful } from '@ngxs/store';

import { Destroyable } from '@core/helpers';
import { Permission } from '@core/interface';
import { UserPermissions } from '@core/enums';
import { WorkflowNavigationTabs } from '@organization-management/workflow/enumns';
import { WorkflowWithDetails } from '@shared/models/workflow.model';
import { WorkflowStateService } from '@organization-management/workflow/services';
import { GetWorkflowsSucceed } from '@organization-management/store/workflow.actions';
import { GetSelectedCardIndex } from '@organization-management/workflow/helpers';

@Component({
  selector: 'app-irp-order-workflow',
  templateUrl: './irp-order-workflow.component.html',
  styleUrls: ['./irp-order-workflow.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IrpOrderWorkflowComponent extends Destroyable implements OnInit {
  @Input() activeTab: WorkflowNavigationTabs;
  @Input() userPermission: Permission;

  public selectedCard: WorkflowWithDetails;
  public showDialog = false;
  public workflowsWithDetails: WorkflowWithDetails[] = [];

  public readonly currentTab: WorkflowNavigationTabs = WorkflowNavigationTabs.IrpOrderWorkFlow;
  public readonly userPermissions = UserPermissions;

  constructor(
    private workflowStateService: WorkflowStateService,
    private actions$: Actions,
    private cdr: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit(): void {
    this.watchForSucceedActionWorkflow();
  }

  public selectWorkflowCard(workflow: WorkflowWithDetails): void {
    const hasWorkflow = workflow && workflow.workflows && workflow.workflows.length > 0;

    if (hasWorkflow) {
      this.workflowsWithDetails = this.workflowStateService.unselectCards(this.workflowsWithDetails);
      workflow.isActive = true;
      this.selectedCard = workflow;
    }

    this.workflowStateService.setSelectedCard(workflow);
  }

  public createWorkflow(): void {
    this.showDialog = true;
  }

  public closeDialog(): void {
    this.showDialog = false;
  }

  private watchForSucceedActionWorkflow(): void {
    this.actions$.pipe(
      filter(() => this.activeTab === WorkflowNavigationTabs.IrpOrderWorkFlow),
      ofActionSuccessful(GetWorkflowsSucceed),
      filter((workflow) => workflow.payload?.length),
      takeUntil(this.componentDestroy()),
    ).subscribe((workflows) => {
      this.workflowsWithDetails = workflows.payload;

      if (this.selectedCard) {
        const selectedCardIndex = GetSelectedCardIndex(this.workflowsWithDetails, this.selectedCard.id as number);

        this.selectWorkflowCard(this.workflowsWithDetails[selectedCardIndex]);
      } else {
        this.selectWorkflowCard(this.workflowsWithDetails[0]);
      }

      this.cdr.markForCheck();
    });
  }
}
