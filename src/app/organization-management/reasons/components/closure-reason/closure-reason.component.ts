import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';

import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { filter, Observable, Subject, takeUntil, takeWhile } from 'rxjs';

import { UserPermissions } from '@core/enums';
import { Permission } from '@core/interface';
import { ReasonsComponent } from '@organization-management/reasons/models/reasons-component.class';
import {
  GetClosureReasonsByPage,
  RemoveClosureReasons,
  SaveClosureReasonsError,
  UpdateClosureReasonsSuccess,
} from '@organization-management/store/reject-reason.actions';
import { RejectReasonState } from '@organization-management/store/reject-reason.state';
import { RejectReasonPage, RejectReasonwithSystem } from '@shared/models/reject-reason.model';
import { ConfirmService } from '@shared/services/confirm.service';

@Component({
  selector: 'app-closure-reason',
  templateUrl: './closure-reason.component.html',
  styleUrls: ['./closure-reason.component.scss'],
})
export class ClosureReasonComponent extends ReasonsComponent implements OnInit,OnDestroy {
  @Input() userPermission: Permission;

  @Select(RejectReasonState.closureReasonsPage)
  public reasons$: Observable<RejectReasonPage>;
  public readonly userPermissions = UserPermissions;
  @Input() showSystem: boolean;
  @Input() system: any;
  public reasonclosure: RejectReasonwithSystem[] = [];
  private unsubscribe$: Subject<void> = new Subject();

  constructor(
    private cd: ChangeDetectorRef,
    protected override readonly store: Store,
    protected override readonly actions$: Actions,
    protected override readonly confirmService: ConfirmService
  ) {
    super(store, actions$, confirmService);
  }

  private getClosureReason() {
    this.reasons$.pipe(
      filter(x => x !== null && x !== undefined), takeUntil(this.unsubscribe$)).subscribe((data) => {
        if (this.system == "VMS")
          this.reasonclosure = data.items.filter((f) => f.includeInVMS == true)
        if (this.system == "IRP")
          this.reasonclosure = data.items.filter((f) => f.includeInIRP == true)
        if (this.system == "ALL")
          this.reasonclosure = data.items
        this.reasonclosure = [...this.reasonclosure];
        this.cd.detectChanges();
      });
  }

  ngOnChanges():void {
    this.getClosureReason();
  }
  
  protected getData(): void {
    this.store.dispatch(new GetClosureReasonsByPage(this.currentPage, this.pageSize, this.orderBy));
  }

  protected remove(id: number): void {
    this.store.dispatch(new RemoveClosureReasons(id));
  }

  protected subscribeOnSaveReasonError(): void {
    this.actions$.pipe(
      ofActionSuccessful(SaveClosureReasonsError),
      takeWhile(() => this.isAlive)
    ).subscribe(() => this.setReasonControlError());
  }

  protected subscribeOnUpdateReasonSuccess(): void {
    this.actions$.pipe(
      ofActionSuccessful(UpdateClosureReasonsSuccess),
      takeWhile(() => this.isAlive)
    ).subscribe(() => this.getData());
  }
}
