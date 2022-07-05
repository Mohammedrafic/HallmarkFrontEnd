import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractGridConfigurationComponent } from "@shared/components/abstract-grid-configuration/abstract-grid-configuration.component";
import { ConfirmService } from "@shared/services/confirm.service";
import {
  CANCEL_REJECTION_REASON,
  DELETE_CONFIRM_TITLE,
  DELETE_RECORD_TEXT,
  DELETE_RECORD_TITLE,
  ONLY_LETTERS
} from "@shared/constants";
import { UserState } from "src/app/store/user.state";
import { ShowSideDialog } from "../../store/app.actions";
import { Actions, ofActionSuccessful, Select, Store } from "@ngxs/store";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { delay, filter, Observable, takeWhile } from "rxjs";
import {
  GetRejectReasonsByPage,
  RemoveRejectReasons,
  SaveRejectReasons,
  SaveRejectReasonsError,
  SaveRejectReasonsSuccess,
  UpdateRejectReasons,
  UpdateRejectReasonsSuccess
} from "@organization-management/store/reject-reason.actions";
import { RejectReasonState } from "@organization-management/store/reject-reason.state";
import { RejectReasonPage } from "@shared/models/reject-reason.model";
import { DialogMode } from "@shared/enums/dialog-mode.enum";

@Component({
  selector: 'app-reject-reason',
  templateUrl: './reject-reason.component.html',
  styleUrls: ['./reject-reason.component.scss']
})
export class RejectReasonComponent extends AbstractGridConfigurationComponent implements OnInit,OnDestroy {
  @Select(RejectReasonState.rejectReasonsPage)
  public rejectReasonPage$: Observable<RejectReasonPage>;

  @Select(UserState.lastSelectedOrganizationId)
  organizationId$: Observable<number>;

  public form: FormGroup;
  public title: string = '';

  private isEdit = false;
  private isAlive = true;

  constructor(
    private confirmService: ConfirmService,
    private store: Store,
    private actions$: Actions
  ) {
    super();
  }

  ngOnInit(): void {
    this.createForm();
    this.initGrid();
    this.subscribeOnSaveReasonError();
    this.subscribeOnUpdateReasonSuccess();
    this.subscribeOnSaveReasonSuccess();
    this.subscribeOnOrganization();
  }

  ngOnDestroy(): void {
    this.isAlive = false;
  }

  public addReason(): void {
    this.title = DialogMode.Add;
    this.isEdit = false;
    this.store.dispatch(new ShowSideDialog(true));
  }

  public saveReason(): void {
    this.form.markAllAsTouched();
    if(this.form.invalid) {
      return;
    }

    if(!this.isEdit) {
      this.store.dispatch(new SaveRejectReasons({ reason: this.form.value.reason }));
    } else if(this.isEdit) {
      const payload = {
        id: this.form.value.id,
        reason: this.form.value.reason
      }

      this.store.dispatch( new UpdateRejectReasons(payload));
    }
  }

  public onEdit(data: {reason: string, id: number}): void {
    this.isEdit = true;
    this.title = DialogMode.Edit;
      this.form.patchValue({
      id: data.id,
      reason: data.reason
    });
    this.store.dispatch(new ShowSideDialog(true));
  }

  public onRemove(id: number): void {
    this.confirmService
      .confirm(DELETE_RECORD_TEXT, {
        title: DELETE_RECORD_TITLE,
        okButtonLabel: 'Delete',
        okButtonClass: 'delete-button'
      })
      .subscribe((confirm: boolean) => {
        if (confirm) {
          this.store.dispatch(new RemoveRejectReasons(id));
        }
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

  public onRowsDropDownChanged(): void {
    this.pageSize = parseInt(this.activeRowsPerPageDropDown);
    this.pageSettings = { ...this.pageSettings, pageSize: this.pageSize };
    this.dispatchNewPage();
  }

  public onGoToClick(event: any): void {
    if (event.currentPage || event.value) {
      this.dispatchNewPage();
    }
  }

  private dispatchNewPage(): void {
    this.store.dispatch(new GetRejectReasonsByPage(this.currentPage, this.pageSize))
  }

  private closeSideDialog(): void {
    this.store.dispatch(new ShowSideDialog(false)).pipe(delay(500)).subscribe(() => {
      this.form.reset();
    });
  }

  private createForm(): void {
    this.form = new FormGroup({
      id: new FormControl(null),
      reason: new FormControl('', [Validators.required, Validators.maxLength(100), Validators.minLength(3), Validators.pattern(ONLY_LETTERS)])
    })
  }

  private initGrid(): void {
    this.store.dispatch(new GetRejectReasonsByPage(this.currentPage, this.pageSize));
  }

  private subscribeOnSaveReasonError(): void {
    this.actions$.pipe(
      ofActionSuccessful(SaveRejectReasonsError),
      takeWhile(() => this.isAlive)
    ).subscribe(() => this.form.controls['reason'].setErrors({'incorrect': true}));
  }

  private subscribeOnSaveReasonSuccess(): void {
    this.actions$.pipe(
      ofActionSuccessful(SaveRejectReasonsSuccess),
      takeWhile(() => this.isAlive)
    ).subscribe(() =>this.closeSideDialog());
  }

  private subscribeOnUpdateReasonSuccess(): void {
    this.actions$.pipe(
      ofActionSuccessful(UpdateRejectReasonsSuccess),
      takeWhile(() => this.isAlive)
    ).subscribe(() => this.initGrid());
  }

  private subscribeOnOrganization(): void {
    this.organizationId$.pipe(takeWhile(() => this.isAlive)).subscribe(id => {
      this.currentPage = 1;
      this.store.dispatch(new GetRejectReasonsByPage(this.currentPage, this.pageSize));
    });
  }
}
