import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Actions, ofActionSuccessful, Store } from '@ngxs/store';
import { RemoveRejectReasons, SaveClosureReasons, SaveClosureReasonsError, SaveRejectReasons, SaveRejectReasonsError, SaveRejectReasonsSuccess, UpdateClosureReasonsSuccess, UpdateRejectReasons } from '@organization-management/store/reject-reason.actions';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { CANCEL_REJECTION_REASON, DELETE_CONFIRM_TITLE, DELETE_RECORD_TEXT, DELETE_RECORD_TITLE, ONLY_LETTERS } from '@shared/constants';
import { DialogMode } from '@shared/enums/dialog-mode.enum';
import { ConfirmService } from '@shared/services/confirm.service';
import { delay, filter, takeWhile } from 'rxjs';
import { ShowSideDialog } from 'src/app/store/app.actions';

export enum ReasonsNavigationTabs {
  Rejection,
  Requisition,
  Closure
}

@Component({
  selector: 'app-reasons',
  templateUrl: './reasons.component.html',
  styleUrls: ['./reasons.component.scss']
})
export class ReasonsComponent extends AbstractGridConfigurationComponent implements OnInit, OnDestroy {
  public selectedTab: ReasonsNavigationTabs = ReasonsNavigationTabs.Rejection;
  public form: FormGroup;
  private isEdit = false;
  public title: string = '';
  private isAlive = true;
  private isSaving = false;

  constructor(private store: Store, private confirmService: ConfirmService, private actions$: Actions) {
    super();
  }

  ngOnInit(): void {
    this.createForm();
    this.subscribeOnSaveReasonSuccess();
  }

  ngOnDestroy(): void {
    this.isAlive = false;
  }

  public onTabSelected(selectedTab: any): void {
    this.selectedTab = selectedTab.selectedIndex;
  }

  private createForm(): void {
    this.form = new FormGroup({
      id: new FormControl(null),
      reason: new FormControl('', [Validators.required, Validators.maxLength(100), Validators.minLength(3), Validators.pattern(ONLY_LETTERS)])
    })
  }

  private subscribeOnSaveReasonSuccess(): void {
    this.actions$.pipe(
      ofActionSuccessful(SaveRejectReasonsSuccess, UpdateClosureReasonsSuccess),
      takeWhile(() => this.isAlive)
    ).subscribe(() =>this.closeSideDialog());
    this.actions$.pipe(
      ofActionSuccessful(SaveRejectReasonsError, SaveClosureReasonsError),
      takeWhile(() => this.isAlive)
    ).subscribe(() => this.isSaving = false);
  }

  public saveReason(): void {
    this.form.markAllAsTouched();
    if(this.form.invalid) {
      return;
    }

    if (!this.isSaving) {
      this.isSaving = true;
      switch (this.selectedTab) {
        case ReasonsNavigationTabs.Rejection:
          if(!this.isEdit) {
            this.store.dispatch(new SaveRejectReasons({ reason: this.form.value.reason }));
          } else if(this.isEdit) {
            const payload = {
              id: this.form.value.id,
              reason: this.form.value.reason
            }
      
            this.store.dispatch( new UpdateRejectReasons(payload));
          }
          break;
        case ReasonsNavigationTabs.Requisition:
          // TODO: pending US
          break;
        case ReasonsNavigationTabs.Closure:
          const payload = {
            id: this.form.value.id,
            reason: this.form.value.reason
          }
          this.store.dispatch(new SaveClosureReasons(payload));
          break;
      }
    }
  }

  public addReason(): void {
    this.title = DialogMode.Add;
    this.isEdit = false;
    this.store.dispatch(new ShowSideDialog(true));
    this.isSaving = false;
  }

  public onEdit(data: {reason: string, id: number}): void {
    this.isEdit = true;
    this.title = DialogMode.Edit;
    this.form.patchValue({
      id: data.id,
      reason: data.reason
    });
    this.store.dispatch(new ShowSideDialog(true));
    this.isSaving = false;
  }

  private closeSideDialog(): void {
    this.store.dispatch(new ShowSideDialog(false)).pipe(delay(500)).subscribe(() => {
      this.form.reset();
    });
  }

  public closeDialog(): void {
    if (this.form.dirty) {
      this.confirmService
        .confirm(CANCEL_REJECTION_REASON, {
          title: DELETE_CONFIRM_TITLE,
          okButtonLabel: 'Leave',
          okButtonClass: 'delete-button',
        })
        .pipe(filter((confirm:boolean) => !!confirm))
        .subscribe(() => {
          this.closeSideDialog()
        });
    } else {
      this.closeSideDialog()
    }
  }
}

