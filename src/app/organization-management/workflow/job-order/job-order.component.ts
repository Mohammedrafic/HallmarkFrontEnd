import { Component, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ShowSideDialog } from '../../../store/app.actions';
import { Store } from '@ngxs/store';
import { filter, Subject } from 'rxjs';
import { ConfirmService } from '@shared/services/confirm.service';
import { CANCEL_COFIRM_TEXT, DELETE_CONFIRM_TITLE } from '@shared/constants';

@Component({
  selector: 'app-job-order',
  templateUrl: './job-order.component.html',
  styleUrls: ['./job-order.component.scss']
})
export class JobOrderComponent implements OnInit, OnDestroy {
  @Input() isActive: boolean = false;

  public isEdit = false;
  public workflowFormGroup: FormGroup;

  get dialogHeader(): string {
    return this.isEdit ? 'Edit' : 'Add';
  }

  private formBuilder: FormBuilder;
  private unsubscribe$: Subject<void> = new Subject();

  constructor(private store: Store,
              @Inject(FormBuilder) private builder: FormBuilder,
              private confirmService: ConfirmService) {
    this.formBuilder = builder;
    this.createWorkflowFormGroup();
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public onAddNewWorkflowClick(): void {
    this.store.dispatch(new ShowSideDialog(true));
  }

  public onCancelFormClick(): void {
    this.confirmService
      .confirm(CANCEL_COFIRM_TEXT, {
        title: DELETE_CONFIRM_TITLE,
        okButtonLabel: 'Leave',
        okButtonClass: 'delete-button'
      }).pipe(filter(confirm => !!confirm))
      .subscribe(() => {
        this.store.dispatch(new ShowSideDialog(false));
        this.isEdit = false;
        this.workflowFormGroup.reset();
      });
  }

  public onSaveFormClick(): void {
    // TODO: add implementation
  }

  private createWorkflowFormGroup(): void {
    this.workflowFormGroup = this.formBuilder.group({
      workflow: ['', Validators.required]
    });
  }
}
