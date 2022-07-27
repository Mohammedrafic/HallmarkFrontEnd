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
import { Observable, Subject, takeWhile, throttleTime } from "rxjs";
import {
  GetClosureReasonsByPage,
  RemoveClosureReasons,
  SaveClosureReasonsError,
  UpdateClosureReasonsSuccess,
} from "@organization-management/store/reject-reason.actions";
import { RejectReasonState } from "@organization-management/store/reject-reason.state";
import { RejectReason, RejectReasonPage } from "@shared/models/reject-reason.model";

@Component({
  selector: 'app-closure-reason',
  templateUrl: './closure-reason.component.html',
  styleUrls: ['./closure-reason.component.scss']
})
export class ClosureReasonComponent extends AbstractGridConfigurationComponent implements OnInit,OnDestroy {
  @Input() form: FormGroup;

  @Output() onEditReasons = new EventEmitter<RejectReason>();

  @Select(RejectReasonState.closureReasonsPage)
  public closureReasonsPage$: Observable<RejectReasonPage>;

  @Select(UserState.lastSelectedOrganizationId)
  organizationId$: Observable<number>;

  private isAlive = true;
  private pageSubject = new Subject<number>();

  constructor(
    private store: Store,
    private actions$: Actions,
    private confirmService: ConfirmService
  ) {
    super();
  }

  ngOnInit(): void {
    this.subscribeOnSaveReasonError();
    this.subscribeOnUpdateReasonSuccess();
    this.subscribeOnOrganization();
  }

  ngOnDestroy(): void {
    this.isAlive = false;
  }

  public override updatePage(): void {
    this.dispatchNewPage();
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
          this.store.dispatch(new RemoveClosureReasons(id));
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
      this.pageSubject.next(event.currentPage || event.value);
    }
  }

  private dispatchNewPage(): void {
    this.store.dispatch(new GetClosureReasonsByPage(this.currentPage, this.pageSize, this.orderBy))
  }

  private subscribeOnSaveReasonError(): void {
    this.actions$.pipe(
      ofActionSuccessful(SaveClosureReasonsError),
      takeWhile(() => this.isAlive)
    ).subscribe(() => this.form.controls['reason'].setErrors({'incorrect': true}));
  }

  private subscribeOnUpdateReasonSuccess(): void {
    this.actions$.pipe(
      ofActionSuccessful(UpdateClosureReasonsSuccess),
      takeWhile(() => this.isAlive)
    ).subscribe(() => this.dispatchNewPage());
  }

  private subscribeOnOrganization(): void {
    this.organizationId$.pipe(takeWhile(() => this.isAlive)).subscribe(id => {
      this.currentPage = 1;
      this.dispatchNewPage();
    });
    this.pageSubject.pipe(takeWhile(() => this.isAlive), throttleTime(100)).subscribe((page) => {
      this.currentPage = page;
      this.dispatchNewPage();
    });
  }
}
