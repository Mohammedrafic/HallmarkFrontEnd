import { Directive, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { RejectReason, RejectReasonPage } from '@shared/models/reject-reason.model';
import { Actions, Select, Store } from '@ngxs/store';
import { Observable, Subject, takeWhile, throttleTime } from 'rxjs';
import { UserState } from '../../../store/user.state';
import { ConfirmService } from '@shared/services/confirm.service';
import { DELETE_RECORD_TEXT, DELETE_RECORD_TITLE } from '@shared/constants';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';

@Directive()
export abstract class ReasonsComponent extends AbstractGridConfigurationComponent implements OnInit, OnDestroy {
  @Input()
  public form: FormGroup;

  @Output()
  public readonly editReason: EventEmitter<RejectReason> = new EventEmitter<RejectReason>();

  @Select(UserState.lastSelectedOrganizationId)
  public readonly organizationId$: Observable<number>;

  protected isAlive = true;

  protected abstract readonly reasons$: Observable<RejectReasonPage>;

  private readonly pageSubject = new Subject<number>();

  constructor(
    protected readonly store: Store,
    protected readonly actions$: Actions,
    protected readonly confirmService: ConfirmService
  ) {
    super();
  }

  public ngOnInit(): void {
    this.subscribeOnSaveReasonError();
    this.subscribeOnUpdateReasonSuccess();
    this.subscribeOnOrganization();
  }

  public ngOnDestroy(): void {
    this.isAlive = false;
  }

  public onEdit(data: RejectReason) {
    this.editReason.emit(data);
  }

  public onRemove(id: number): void {
    this.confirmService
      .confirm(DELETE_RECORD_TEXT, {
        title: DELETE_RECORD_TITLE,
        okButtonLabel: 'Delete',
        okButtonClass: 'delete-button',
      })
      .subscribe((confirm: boolean) => {
        if (confirm) {
          this.remove(id);
        }
      });
  }

  public onRowsDropDownChanged(): void {
    this.pageSize = parseInt(this.activeRowsPerPageDropDown);
    this.pageSettings = { ...this.pageSettings, pageSize: this.pageSize };
  }

  public onGoToClick(event: any): void {
    if (event.currentPage || event.value) {
      this.pageSubject.next(event.currentPage || event.value);
    }
  }

  protected abstract getData(): void;

  protected abstract remove(id: number): void;

  protected abstract subscribeOnSaveReasonError(): void;

  protected abstract subscribeOnUpdateReasonSuccess(): void;

  protected setReasonControlError(): void {
    this.form.controls['reason'].setErrors({ incorrect: true });
  }

  protected subscribeOnOrganization(): void {
    this.organizationId$.pipe(takeWhile(() => this.isAlive)).subscribe(() => {
      this.currentPage = 1;
      this.getData();
    });

    this.pageSubject
      .pipe(
        takeWhile(() => this.isAlive),
        throttleTime(100)
      )
      .subscribe((page) => {
        this.currentPage = page;
        this.getData();
      });
  }
}
