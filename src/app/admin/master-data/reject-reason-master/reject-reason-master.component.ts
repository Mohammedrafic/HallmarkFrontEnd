import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from "@angular/forms";
import { DialogMode } from "@shared/enums/dialog-mode.enum";
import { ShowSideDialog } from "../../../store/app.actions";
import { Actions, ofActionSuccessful, Select, Store } from "@ngxs/store";
import { CANCEL_REJECTION_REASON, DELETE_CONFIRM_TITLE, DELETE_RECORD_TEXT, DELETE_RECORD_TITLE, ONLY_LETTERS } from "@shared/constants";
import { delay, filter, Observable, takeWhile } from "rxjs";
import { ConfirmService } from "@shared/services/confirm.service";
import { RejectReasonPage } from "@shared/models/reject-reason.model";
import { RejectReasonMasterState } from "@admin/store/reject-reason-mater.state";
import {
  GetRejectReasonsMasterByPage,
  RemoveRejectMaterReasons,
  SaveRejectMasterReasons,
  SaveRejectMasterReasonsError,
  SaveRejectMasterReasonsSuccess,
  UpdateRejectMasterReasons,
  UpdateRejectMasterReasonsSuccess
} from "@admin/store/reject-reason-mater.action";
import { AbstractPermissionGrid } from '@shared/helpers/permissions';

@Component({
  selector: 'app-reject-reason-master',
  templateUrl: './reject-reason-master.component.html',
  styleUrls: ['./reject-reason-master.component.scss']
})
export class RejectReasonMasterComponent extends AbstractPermissionGrid implements OnInit {
  @Select(RejectReasonMasterState.rejectReasonsPage)
  public rejectReasonPage$: Observable<RejectReasonPage>;

  get reasonControl(): AbstractControl | null {
    return this.form.get('reason');
  }

  public form: FormGroup;
  public title: string = '';

  private isEdit = false;
  private isAlive = true;

  constructor(
    private confirmService: ConfirmService,
    protected override store: Store,
    private actions$: Actions
  ) {
    super(store);
  }

  public override ngOnInit(): void {
    super.ngOnInit();
    this.createForm();
    this.initGrid();
    this.subscribeOnSaveReasonError();
    this.subscribeOnUpdateReasonSuccess();
    this.subscribeOnSaveReasonSuccess();
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
      this.store.dispatch(new SaveRejectMasterReasons({ reason: this.form.value.reason }));
    } else if(this.isEdit) {
      const payload = {
        id: this.form.value.id,
        reason: this.form.value.reason
      }

      this.store.dispatch( new UpdateRejectMasterReasons(payload));
    }
  }

  public closeDialog(): void {
    if (this.form.dirty) {
      this.confirmService
        .confirm(CANCEL_REJECTION_REASON, {
          title: DELETE_CONFIRM_TITLE,
          okButtonLabel: 'Leave',
          okButtonClass: 'delete-button',
        })
        .pipe(
          filter((confirm:boolean) => !!confirm),
          takeWhile(() => this.isAlive)
        ).subscribe(() => {
          this.closeSideDialog()
        });
    } else {
      this.closeSideDialog()
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
      }).pipe(
        takeWhile(() => this.isAlive)
      ).subscribe((confirm: boolean) => {
        if (confirm) {
          this.store.dispatch(new RemoveRejectMaterReasons(id));
        }
      });
  }

  public onRowsDropDownChanged(): void {
    this.pageSize = parseInt(this.activeRowsPerPageDropDown);
    this.pageSettings = { ...this.pageSettings, pageSize: this.pageSize };
    this.initGrid();
  }

  public onGoToClick(event: any): void {
    if (event.currentPage || event.value) {
      this.initGrid();
    }
  }

  private initGrid(): void {
    this.store.dispatch(new GetRejectReasonsMasterByPage(this.currentPage, this.pageSize));
  }

  private createForm(): void {
    this.form = new FormGroup({
      id: new FormControl(null),
      reason: new FormControl('', [Validators.required, Validators.maxLength(100), Validators.minLength(3), Validators.pattern(ONLY_LETTERS)])
    })
  }

  private closeSideDialog(): void {
    this.store.dispatch(new ShowSideDialog(false)).pipe(delay(500)).subscribe(() => {
      this.form.reset();
    });
  }

  private subscribeOnSaveReasonError(): void {
    this.actions$.pipe(
      ofActionSuccessful(SaveRejectMasterReasonsError),
      takeWhile(() => this.isAlive)
    ).subscribe(() => this.form.controls['reason'].setErrors({'incorrect': true}));
  }

  private subscribeOnUpdateReasonSuccess(): void {
    this.actions$.pipe(
      ofActionSuccessful(UpdateRejectMasterReasonsSuccess),
      takeWhile(() => this.isAlive)
    ).subscribe(() => this.initGrid());
  }

  private subscribeOnSaveReasonSuccess(): void {
    this.actions$.pipe(
      ofActionSuccessful(SaveRejectMasterReasonsSuccess),
      takeWhile(() => this.isAlive)
    ).subscribe(() => this.closeSideDialog());
  }
}
