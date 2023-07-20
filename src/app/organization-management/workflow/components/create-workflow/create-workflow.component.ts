import { Component, OnInit, ChangeDetectionStrategy, Inject, Input } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { FormGroup } from '@angular/forms';

import { filter, take, takeUntil } from 'rxjs';
import { Actions, ofActionSuccessful } from '@ngxs/store';

import { DestroyDialog } from '@core/helpers';
import { FieldType } from '@core/enums';
import {
  WorkflowDialogConfig,
} from '@organization-management/workflow/components/create-workflow/constants/create-workflow.constant';
import { CreateWorkflow, WorkflowField } from '@organization-management/workflow/interfaces/create-workflow.inteface';
import {
  CreateWorkflowService,
} from '@organization-management/workflow/components/create-workflow/services/create-workflow.service';
import { CANCEL_CONFIRM_TEXT, DELETE_CONFIRM_TITLE } from '@shared/constants';
import { ConfirmService } from '@shared/services/confirm.service';
import { WorkflowNavigationTabs } from '@organization-management/workflow/enumns';
import { SaveWorkflowSucceed } from '@organization-management/store/workflow.actions';

@Component({
  selector: 'app-create-workflow',
  templateUrl: './create-workflow.component.html',
  styleUrls: ['./create-workflow.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateWorkflowComponent extends DestroyDialog implements OnInit {
  @Input() selectedTab: WorkflowNavigationTabs;

  public targetElement: HTMLElement | null = this.document.body.querySelector('#main');
  public workflowForm: FormGroup;

  public readonly workflowConfig: CreateWorkflow = WorkflowDialogConfig;
  public readonly fieldTypes = FieldType;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private createWorkflowService: CreateWorkflowService,
    private confirmService: ConfirmService,
    private actions$: Actions,
  ) {
    super();
  }

  ngOnInit(): void {
    this.watchForCloseStream();
    this.initForm();
    this.watchForSucceedSaveWorkflow();
  }

  public trackByField(index: number, config: WorkflowField): string {
    return config.field;
  }

  public saveWorkflow(): void {
    this.createWorkflowService.saveWorkflow(this.selectedTab, this.workflowForm);
  }

  public closeModal(): void {
    if (this.workflowForm.dirty) {
      this.confirmService
        .confirm(CANCEL_CONFIRM_TEXT, {
          title: DELETE_CONFIRM_TITLE,
          okButtonLabel: 'Leave',
          okButtonClass: 'delete-button',
        }).pipe(
        filter(confirm => confirm),
        take(1)
      ).subscribe(() => {
        this.closeWorkflowDialog();
      });
    } else {
      this.closeWorkflowDialog();
    }
  }

  private watchForSucceedSaveWorkflow(): void {
    this.actions$.pipe(
      ofActionSuccessful(SaveWorkflowSucceed),
      takeUntil(this.componentDestroy()),
    ).subscribe(() => {
      this.closeWorkflowDialog();
    });
  }

  private initForm(): void {
    this.workflowForm = this.createWorkflowService.createWorkflowForm();
  }

  private closeWorkflowDialog(): void {
    this.workflowForm.reset();
    this.closeDialog();
  }
}
