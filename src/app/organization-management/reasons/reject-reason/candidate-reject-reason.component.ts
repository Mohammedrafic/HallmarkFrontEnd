import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractGridConfigurationComponent } from "@shared/components/abstract-grid-configuration/abstract-grid-configuration.component";
import { ConfirmService } from "@shared/services/confirm.service";
import {
  DELETE_RECORD_TEXT,
  DELETE_RECORD_TITLE,
} from "@shared/constants";
import { UserState } from "src/app/store/user.state";
import { Actions, ofActionSuccessful, Select, Store } from "@ngxs/store";
import { FormGroup } from "@angular/forms";
import { Observable, takeWhile } from "rxjs";
import {
  GetRejectReasonsByPage,
  RemoveRejectReasons,
  SaveRejectReasonsError,
  UpdateRejectReasonsSuccess
} from "@organization-management/store/reject-reason.actions";
import { RejectReasonState } from "@organization-management/store/reject-reason.state";
import { RejectReason, RejectReasonPage } from "@shared/models/reject-reason.model";
import { DialogMode } from "@shared/enums/dialog-mode.enum";

@Component({
  selector: 'app-candidate-reject-reason',
  templateUrl: './candidate-reject-reason.component.html',
  styleUrls: ['./candidate-reject-reason.component.scss']
})
export class CandidateRejectReasonComponent extends AbstractGridConfigurationComponent implements OnInit,OnDestroy {
  @Input() form: FormGroup;

  @Output() onEditReasons = new EventEmitter<RejectReason>();

  @Select(RejectReasonState.rejectReasonsPage)
  public rejectReasonPage$: Observable<RejectReasonPage>;

  @Select(UserState.lastSelectedOrganizationId)
  organizationId$: Observable<number>;

  private isAlive = true;

  constructor(
    private store: Store,
    private actions$: Actions,
    private confirmService: ConfirmService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initGrid();
    this.subscribeOnSaveReasonError();
    this.subscribeOnUpdateReasonSuccess();
    this.subscribeOnOrganization();
  }

  ngOnDestroy(): void {
    this.isAlive = false;
  }

  public onEdit(data: RejectReason) {
    this.onEditReasons.emit(data);
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

  private initGrid(): void {
    this.store.dispatch(new GetRejectReasonsByPage(this.currentPage, this.pageSize));
  }

  private subscribeOnSaveReasonError(): void {
    this.actions$.pipe(
      ofActionSuccessful(SaveRejectReasonsError),
      takeWhile(() => this.isAlive)
    ).subscribe(() => this.form.controls['reason'].setErrors({'incorrect': true}));
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
